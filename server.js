const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const stripe = require("./stripe");
const Customers = require("./models/customers.model");
mongoose.connect(
  "mongodb+srv://nasim:nasim@expense.ckhwn9v.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("MongoDB connection established");
  }
);
const endpointSecret =
  "whsec_d4569345b2df5290246c8266d76f163b6df33c5c773cb50105051c145d70fc16";
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`listening on port: ${port}`));
const products = {
  free: "price_1ML3ARSFAyIqkgIKi4GHTz0K",
  business: "price_1ML0VpSFAyIqkgIKjJ4iZR9S",
  enterprise: "price_1ML3MKSFAyIqkgIKUY5uHTf2",
};
app.get("/", (req, res) => {
  console.log(req.session);
});
app.get("/success", (req, res) => {
  res.send("payment success");
});
app.get("/failed", (req, res) => {
  res.send("payment failed,something went wrong");
});
app.post("/createCustomer", async (req, res) => {
  const { email } = req.body;
  const customer = await stripe.addNewCustomer(email);
  const { id } = customer;
  const customerData = new Customers({ email, id });
  const newCustomer = await customerData.save();
  res.send(customer);
});
app.post("/customerPortal", async (req, res) => {
  const { email } = req.body;
  const customer = await Customers.findOne({ email });
  const id = customer.id;
  const url = await stripe.createPortal(id);
  res.send({ url });
});
app.get("/getCustomer", async (req, res) => {
  const { email } = req.body;
  const customer = await Customers.findOne({ email });
  res.send(customer);
});
app.post("/checkout", async (req, res) => {
  const { email, product } = req.body;
  let stripeProduct = "";
  switch (product) {
    case "Free Trail":
      stripeProduct = products.free;
      break;
    case "Business Plan":
      stripeProduct = products.business;
      break;
    case "Enterprise Plan":
      stripeProduct = products.enterprise;
      break;
    default:
      stripeProduct = products.free;
  }
  const customer = await Customers.findOne({ email });
  const { id } = customer;
  const session = await stripe.createCheckoutSession(id, stripeProduct);
  console.log(session);
  res.send({ sessionId: session.id });
});
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event, session;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_failed":
        session = event.data.object;
        // Then define and call a function to handle the event checkout.session.async_payment_failed
        break;
      case "checkout.session.async_payment_succeeded":
        session = event.data.object;
        // Then define and call a function to handle the event checkout.session.async_payment_succeeded
        break;
      case "checkout.session.completed":
        session = event.data.object;
        // Then define and call a function to handle the event checkout.session.completed
        break;
      case "checkout.session.expired":
        session = event.data.object;
        // Then define and call a function to handle the event checkout.session.expired
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    console.log(session)
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);
app.post("/hello", (req, res) => {
  console.log("someone requested...");
});
