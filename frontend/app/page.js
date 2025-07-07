
export default async function Home() {
  try {
    const open_orders_data = await fetch(process.env.NEXT_PUBLIC_API_URL + 'orders/top_5')
    
    if (!open_orders_data.ok) {
      throw new Error('Failed to fetch orders')
    }
    
    const open_orders = await open_orders_data.json()
    
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            <div>
                {open_orders.map( o => (
                  <div key={o.orderid} className="order-line">
                    <span>{o.orderid}</span>
                    <span>{o.customer.name}</span>
                  </div>
                ))}
            </div> 
        </main>
      </div>
    );
  } catch (error) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div>Error loading orders: {error.message}</div>
        </main>
      </div>
    );
  }
}
