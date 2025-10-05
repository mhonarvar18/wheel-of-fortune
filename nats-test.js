import { connect } from "nats";

try {
  const nc = await connect({
    servers: "nats://127.0.0.1:4222",
    tls: false,
    noRandomize: true,
    reconnect: true,
    maxReconnectAttempts: -1,
  });
  console.log("✅ Connected to NATS:", nc.getServer());
  await nc.close();
} catch (err) {
  console.error("❌ NATS connect error:", err.message);
}
