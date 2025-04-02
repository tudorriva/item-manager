const Item = require('../models/itemModel');
const User = require('../models/userModel');

// Get overall inventory statistics
exports.getItemStats = async (req, res) => {
  try {
    // Run multiple aggregations in parallel for better performance
    const [totalStats, quantityStats, ownerStats, categoryDistribution] = await Promise.all([
      // Basic stats about items
      Item.aggregate([
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            avgQuantity: { $avg: '$quantity' },
            minQuantity: { $min: '$quantity' },
            maxQuantity: { $max: '$quantity' }
          }
        }
      ]),
      
      // Items by stock level
      Item.aggregate([
        {
          $group: {
            _id: {
              stockLevel: {
                $switch: {
                  branches: [
                    { case: { $lte: ['$quantity', 5] }, then: 'Low Stock' },
                    { case: { $lte: ['$quantity', 20] }, then: 'Medium Stock' },
                  ],
                  default: 'High Stock'
                }
              }
            },
            count: { $sum: 1 },
            items: { $push: { id: '$_id', name: '$name', quantity: '$quantity' } }
          }
        },
        { $sort: { '_id.stockLevel': 1 } }
      ]),
      
      // Items by owner
      Item.aggregate([
        { $match: { owner: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$owner',
            totalItems: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            items: { $push: { id: '$_id', name: '$name', quantity: '$quantity' } }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'ownerInfo'
          }
        },
        { $unwind: { path: '$ownerInfo', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            owner: { $ifNull: ['$ownerInfo.name', 'Unknown'] },
            totalItems: 1,
            totalQuantity: 1,
            items: 1
          }
        },
        { $sort: { totalItems: -1 } }
      ]),
      
      // Recently added items
      Item.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $project: {
            name: 1,
            quantity: 1,
            createdAt: 1,
            daysSinceCreation: {
              $divide: [
                { $subtract: [new Date(), '$createdAt'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      ])
    ]);

    // Send JSON response if API request
    if (req.path.startsWith('/api/')) {
      return res.status(200).json({
        status: 'success',
        data: {
          totalStats: totalStats[0] || {},
          quantityStats,
          ownerStats,
          categoryDistribution
        }
      });
    }

    // Render view with stats
    res.render('stats', {
      title: 'Inventory Statistics',
      totalStats: totalStats[0] || {
        totalItems: 0,
        totalQuantity: 0,
        avgQuantity: 0,
        minQuantity: 0,
        maxQuantity: 0
      },
      quantityStats,
      ownerStats,
      categoryDistribution
    });
  } catch (err) {
    console.error('Error generating statistics:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error generating statistics'
    });
  }
};

// Get user activity statistics
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          users: { $push: { id: '$_id', name: '$name', email: '$email' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    console.error('Error generating user statistics:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error generating user statistics'
    });
  }
};