import { cli, Strategy } from "@agentrhq/webcmd/registry";
cli({
  site: "quickmart",
  name: "checkout",
  description: "Deterministic Quick Commerce checkout adapter",
  strategy: Strategy.PUBLIC,
  access: "write",
  browser: false,
  args: [],
  columns: ["order_id", "item_title", "price", "payment_status", "delivery_eta", "detail_url"],
  func: async (kwargs) => {
    return [{
      order_id: `QM-${Math.floor(Math.random() * 1e6)}`,
      item_title: `Quickmart Item ITEM_99`,
      price: "$12.99",
      payment_status: "SUCCESS",
      delivery_eta: "10:00-10:30",
      detail_url: `https://quickmart.mock/orders/QM-000`
    }];
  }
});
