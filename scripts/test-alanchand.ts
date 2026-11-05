import { fetchAllAlanChandPrices } from "@/lib/alanchand";

async function main() {
  const result = await fetchAllAlanChandPrices();
  console.log("=== Errors ===");
  console.log(result.errors);
  console.log("\n=== Currencies ===");
  for (const c of result.currencies) {
    console.log(
      `${c.code}: ${c.name} → buy ${c.tomanBuy.toLocaleString()} / sell ${c.tomanSell.toLocaleString()} (${c.changeDirection})`,
    );
  }
  console.log("\n=== Gold ===");
  for (const g of result.gold) {
    console.log(
      `${g.code}: ${g.name} → ${g.price.toLocaleString()} ${g.currency} (${g.changePercent ?? "n/a"}%)`,
    );
  }
  console.log("\n=== Crypto ===");
  for (const c of result.crypto) {
    console.log(
      `${c.code}: ${c.englishName} (${c.symbol}) → ${c.tomanPrice.toLocaleString()} TMN, $${c.usdPrice.toLocaleString()} (${c.tomanChangePercent}% TMN, ${c.usdChangePercent}% USD)`,
    );
  }
}

main().catch(console.error);
