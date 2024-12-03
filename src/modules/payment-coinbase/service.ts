import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { CoinbaseClient } from "./services"
import { CoinbaseClientOptions } from "./types"

type InjectedDependencies = {
    logger: Logger,
    coinbaseClient: CoinbaseClient
}

type Options = {
    apiKey: string
}

class CoinbaseCommercePaymentProviderService extends AbstractPaymentProvider<Options> {

    static identifier: string = "coinbase-commerce"
    protected logger_: Logger
    protected options_: CoinbaseClientOptions
    protected client: CoinbaseClient

    constructor(
        { logger, coinbaseClient }: InjectedDependencies,
        options: Options
    ) {
        // @ts-ignore
        super(...arguments)

        this.logger_ = logger
        this.options_ = options
        this.client = coinbaseClient

    }

    static validateOptions(options: Record<any, any>): void | never {
        if (!options.apiKey) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "API Key is required in the payment provider's options."
            )
        }
    }

}

export default CoinbaseCommercePaymentProviderService