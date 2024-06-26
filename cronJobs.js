const cron = require('node-cron');
const Subscription = require('./models/Subscription');
cron.schedule('0 0 0 * * *', async () => {
  try {
    const now = new Date();

    const subscriptions = await Subscription.find({
      plan: 'free'
    });

    for (let subscription of subscriptions) {
      const endDate = new Date(subscription.endDate);
      const monthPassed = now >= endDate;

      if (monthPassed) {
        subscription.apiCalls = 0;
        subscription.startDate = endDate;
        subscription.endDate = new Date(now.setMonth(now.getMonth() + 1));
        await subscription.save();
      }
    }

    console.log('Cron job executed successfully. Expired subscriptions updated.');
  } catch (error) {
    console.error('Error executing cron job:', error);
  }
});
