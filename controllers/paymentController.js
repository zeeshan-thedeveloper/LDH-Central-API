const dotenv=require('dotenv')
dotenv.config()

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_TEST);

// const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST)

const makePayment = async (req, res) => {

  try {
    let { amount, id } = req.body;
    console.log(req.body)
    const payment = await stripe.paymentIntents.create({
        amount,
      currency: "USD",
      description: "Local-database-hosting",
      payment_method: id,
      confirm: true,
    });

    // console.log(payment)
    res
      .status(200)
      .send({ success: true, msg: `Paid successfully`, data: payment });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports={
    makePayment
}