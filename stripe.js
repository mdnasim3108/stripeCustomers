const stripe=require("stripe")("sk_test_51Lw56vSFAyIqkgIKVFt0lCVJ4CK0uYfw9TURYk12rZe7DkOLXi67GDzNf9LygQAXgA3JbuM5Ix7epxXCBnEH970t00ZEzu4Awv")

const addNewCustomer=async(email)=>{
    const customer=await stripe.customers.create({
        email,
        description:"a new customer has been created",
    })
    return customer
}
const createCheckoutSession=async(customer,price)=>{
    const session=await stripe.checkout.sessions.create({
        mode:"subscription",
        payment_method_types:["card"],
        customer,
        line_items:[{
            price,
            quantity:1
    }],
    success_url:`http://localhost:3000/home?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:`http://localhost:4000/failed`
    })
    return session;
}
const createPortal=async(customer)=>{
    const session=await stripe.billingPortal.sessions.create({
        customer,
        return_url:"http://localhost:3000/home"
    })
    return session.url;
}
const getCustomer=async(email)=>{
    const customer=await stripe.customers.retrieve(email);
    return customer;
}
module.exports={
    addNewCustomer,
    createCheckoutSession,
    getCustomer,
    createPortal
}