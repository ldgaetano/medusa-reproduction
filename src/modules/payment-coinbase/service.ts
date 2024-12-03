import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"

type InjectedDependencies = {
    logger: Logger
}

type Options = {
    apiKey: string
}

class CoinbaseCommercePaymentProviderService extends AbstractPaymentProvider<Options> {

    static identifier: string = "coinbase-commerce"
    protected logger_: Logger
    protected options_: Options

    constructor(
        { logger }: InjectedDependencies,
        options: Options
    ) {
        // @ts-ignore
        super(...arguments)

        this.logger_ = logger
        this.options_ = options
    }

}

export default CoinbaseCommercePaymentProviderService