const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product_id: { type: String, required: true },
            name: { type: String, required: true },
            image: { type: String, required: true },
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            total: { type: Number, required: true },
        },
    ],
});

module.exports = mongoose.model('Cart', cartSchema);
