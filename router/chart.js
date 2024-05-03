const router = require('express').Router();
const Orders = require('../model/frameDeatails.model');
const gifts = require('../model/gifts.model');

router.get('/today_sale', async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set hours to midnight for the beginning of the day

    try {
        // Find orders placed today
        const orderCount = await Orders.find({
            chreatedAt: {
                $gte: today,
                $lte: Date.now()
            }, deliveryStatus: 'Delivered'
        });

        let total = 0;

        orderCount.forEach((order) => {
            total += order.totalAmount
        })

        res.send({ totalSales: orderCount.length, totalAmount: total });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error.message);
    }

});



router.get('/monthly_sale', async (req, res) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = Date.now();

    try {
        const monthlySales = await Orders.find({ chreatedAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }, deliveryStatus: 'Delivered' })

        console.log(monthlySales)
        if (monthlySales.length > 0) {


            let total = 0;

            monthlySales.forEach((order) => {
                total += order.totalAmount
            })
            res.send({ totalSales: monthlySales.length, totalAmount: total });
        } else {
            res.send({ totalSales: 0, totalAmount: 0 });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error.message)
    }
});


router.get('/total_sales', async (req, res) => {

    try {
        const total = await Orders.aggregate([
            {
                $match: {
                    deliveryStatus: 'Delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);

        res.send({ totalSales: total });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/chart_data', async function (req, res) {
    try {
        const fromDate = new Date(parseInt(req.query.fromDate));
        const interval = req.query.interval;
        const salesData = await getSalesDataForRange(fromDate, interval);

        let salesMap = [];

        if (interval === 'month') {
            salesMap = await getDaysArray(fromDate.getMonth(), fromDate.getFullYear(), salesData);
        } else {

            for (let i = 1; i <= 12 && isCurrentMonth(-1, i - 2, fromDate.getFullYear()); i++) {
                let sle = salesData.find(entry => {
                    return i === entry.month;
                });

                if (sle) {

                    salesMap.push({ month: sle.month - 1, count: sle.count });
                } else {
                    salesMap.push({ month: i - 1, count: 0 });

                }

            }
        }

        res.send(salesMap);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error.message);
    }
});


router.get('/recent_orders', async (req, res) => {
    try {
        const order = await Orders.find({ isViewed: false, status: true }).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'product',
        }).populate({
            path: 'gifts',
            populate: {
                path: 'gift'
            }
        }).sort({ chreatedAt: -1 });

        res.send(order);


    } catch (error) {
        res.status(500).send({ err: error.message })
    }
});


router.get('/gifts', async (req, res) => {
    try {
        const gift = await gifts.find({ quantity: { $lt: 1 } });

        res.send(gift);

    } catch (error) {
        res.status(404).send({ err: error.message });
    }
})


async function getDaysArray(month, year, salesData) {
    const numDays = new Date(year, month + 1, 0).getDate(); // Get the number of days in the month
    const daysArray = [];



    for (let i = 1; i <= numDays && isCurrentMonth(i, month, year); i++) {
        let entry = salesData.find(data => {
            return +data._id === +i; // Check if there's data for this day
        });

        if (entry) {
            daysArray.push({ date: +entry._id, count: entry.count, month });
        } else {
            daysArray.push({ date: i, count: 0, month });
        }
    }

    return daysArray;
}


function isCurrentMonth(date, month, year) {

    const todayDate = new Date();

    const currentMonth = todayDate.getMonth();
    const currentDate = todayDate.getDate();
    const currentYear = todayDate.getFullYear();

    if (year === currentYear) {

        if (month < currentMonth) {
            return true;
        }
        else if (date <= currentDate && date !== -1) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}


async function getSalesDataForRange(date, interval) {
    let pipeline = [];
    if (interval === 'year') {
        pipeline = [
            {
                $match: {
                    $expr: { $eq: [{ $year: "$chreatedAt" }, { $year: date }] },
                    deliveryStatus: "Delivered" // New condition
                }
            },
            {
                $group: {
                    _id: { $month: "$chreatedAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    month: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { month: 1 }
            }
        ];
    } else if (interval === 'month') {
        pipeline = [
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$chreatedAt" }, { $year: date }] }, // Match year
                            { $eq: [{ $month: "$chreatedAt" }, { $month: date }] } // Match month
                        ]
                    },
                    deliveryStatus: "Delivered" // New condition
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%d", date: "$chreatedAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ];
    }

    const salesData = await Orders.aggregate(pipeline);
    return salesData;
}



module.exports = router;

