const mongoose = require('mongoose');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const mongoURI =
  'mongodb+srv://evolvebay:evo1234@cluster0.qni5l9e.mongodb.net/';

const plans = {
  free: {
    title: 'Free',
    features: [
      'Suggestions',
      'Tone Adjustment',
      'Communication Context',
      'Limited Email Replies',
      'Limited Suggestions',
    ],
    price: 0,
    apiCounts: 100,
  },
  monthly: {
    title: 'Monthly',
    features: [
      'Unlimited Emails',
      'Personalized, human-like responses',
      'Unlimited Suggestions',
      'Tone Adjustment',
      'Communication Context',
    ],
    price: 24.99,
    apiCounts: 1000,
  },
  yearly: {
    title: 'Yearly',
    features: [
      'Access to new features',
      'Priority support',
      'Unlimited Emails',
      'Personalized, human-like responses',
      'Unlimited Suggestions',
      'Tone Adjustment',
      'Communication Context',
    ],
    price: 129,
    apiCounts: 12000,
  },
};
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    async function savePlans() {
      try {
        for (const planKey of Object.keys(plans)) {
          const plan = plans[planKey];
          const newPlan = new SubscriptionPlan({
            planTitle: planKey,
            planFeatures: plan.features,
            planPrice: plan.price,
            planApiCounts: plan.apiCounts,
          });
          await newPlan.save();
          console.log(`Saved plan '${plan.title}'`);
        }
        console.log('All plans saved successfully');
      } catch (error) {
        console.error('Error saving plans:', error);
      } finally {
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
      }
    }
    savePlans();
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));
