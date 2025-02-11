import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { getOrderStatus } from '../../lib/helpers'

const recentOrderData = [
    {
        id: '1',
        product_id: '4324',
        customer_id: '23143',
        customer_name: 'Shirley A. Lape',
        order_date: '2022-05-17T03:24:00',
        order_total: '$435.50',
        current_order_status: 'PLACED',
        shipment_address: 'Cottage Grove, OR 97424'
    },
    {
        id: '7',
        product_id: '7453',
        customer_id: '96453',
        customer_name: 'Ryan Carroll',
        order_date: '2022-05-14T05:24:00',
        order_total: '$96.35',
        current_order_status: 'CONFIRMED',
        shipment_address: 'Los Angeles, CA 90017'
    },
    {
        id: '2',
        product_id: '5434',
        customer_id: '65345',
        customer_name: 'Mason Nash',
        order_date: '2022-05-17T07:14:00',
        order_total: '$836.44',
        current_order_status: 'SHIPPED',
        shipment_address: 'Westminster, CA 92683'
    },
    {
        id: '3',
        product_id: '9854',
        customer_id: '87832',
        customer_name: 'Luke Parkin',
        order_date: '2022-05-16T12:40:00',
        order_total: '$334.50',
        current_order_status: 'SHIPPED',
        shipment_address: 'San Mateo, CA 94403'
    },
    {
        id: '4',
        product_id: '8763',
        customer_id: '09832',
        customer_name: 'Anthony Fry',
        order_date: '2022-05-14T03:24:00',
        order_total: '$876.00',
        current_order_status: 'OUT_FOR_DELIVERY',
        shipment_address: 'San Mateo, CA 94403'
    },
    {
        id: '5',
        product_id: '5627',
        customer_id: '97632',
        customer_name: 'Ryan Carroll',
        order_date: '2022-05-14T05:24:00',
        order_total: '$96.35',
        current_order_status: 'DELIVERED',
        shipment_address: 'Los Angeles, CA 90017'
    }
]

export default function RecentOrders() {
    return (
        <div className="bg-white px-4 pt-3 pb-4 rounded-sm border border-gray-200 flex-1">
            <strong className="text-neutral-700 font-semibold">Recent Orders</strong>
            <div className="rounded-sm mt-3">
                <table className="w-full border-collapse table-fixed">
                    <thead className="rounded-sm bg-gray-100 text-neutral-600">
                        <tr className="text-sm font-medium uppercase xsm:text-base">
                            <th className="p-2 xl:p-5">ID</th>
                            <th className="p-2 xl:p-5">Student ID</th>
                            <th className="p-2 xl:p-5">Class Name</th>
                            <th className="p-2 xl:p-5">Attended At</th>
                        </tr>
                    </thead>
                    <tbody className="rounded-sm text-neutral-600">
                        {recentOrderData.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-center">
                                    <Link to={`/order/${order.id}`}>#{order.id}</Link>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Link to={`/product/${order.product_id}`}>#{order.product_id}</Link>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Link to={`/customer/${order.customer_id}`}>{order.customer_name}</Link>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {format(new Date(order.order_date), 'dd MMM yyyy')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
