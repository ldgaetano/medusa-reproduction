import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import CoinbaseCommercePaymentProviderService from "../service"
import { Modules } from "@medusajs/framework/utils"
import { model } from "@medusajs/framework/utils"

const DummyModel = model.define("dummy_model", {
    id: model.id().primaryKey()
})

moduleIntegrationTestRunner<CoinbaseCommercePaymentProviderService>({
    moduleName: Modules.PAYMENT,
    moduleModels: [DummyModel],
    resolve: "./src/modules/payment-coinbase",
    moduleOptions: {
        apiKey: process.env.COINBASE_COMMERCE_API_KEY
    },
    testSuite: ({ service }) => {

    }
})