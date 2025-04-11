// @ts-nocheck
function CartItem({ item }) {
    return (
        <tr>
            <td>{item.product_name}</td>
            <td>${item.price}</td>
            <td>{item.quantity}</td>
            <td>${item.total.toFixed(2)}</td>
        </tr>
    );
}

export default CartItem;