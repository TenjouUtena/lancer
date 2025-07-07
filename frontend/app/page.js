
export default async function Home() {
  let open_orders_data = await fetch(process.env.API_URL + 'orders/top_5')
  let open_orders = await open_orders_data.json()
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div>
              {open_orders.map( o => {
                <div className="order-line">
                  <span>{o.orderid}</span>
                  <span>{o.customer.name}</span>
                </div>
              })}
          </div> 
      </main>
    </div>
  );
}
