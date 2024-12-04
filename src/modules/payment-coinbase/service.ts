import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils"
import { CreatePaymentProviderSession, Logger, PaymentProviderError, PaymentProviderSessionResponse, PaymentSessionStatus, ProviderWebhookPayload, UpdatePaymentProviderSession, WebhookActionResult } from "@medusajs/framework/types"
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
    public client: CoinbaseClient

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

    async initiatePayment(context: CreatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
        
        // TODO
        console.log("Testing initiate payment.")

        return {
            data: {}
        }

    }

    async authorizePayment(
        paymentSessionData: Record<string, unknown>,
        context: Record<string, unknown>
    ): Promise<
        PaymentProviderError | {
            status: PaymentSessionStatus,
            data: PaymentProviderSessionResponse["data"]
        }
    > {

        // TODO

        return {
            data: {},
            status: "authorized"
        }

    }

    async capturePayment(
        paymentData: Record<string, unknown>
    ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        
        // TODO
        
        return {}

    }

    async cancelPayment(paymentData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        
        // TODO

        return {}

    }

    async deletePayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        
        // TODO

        return {}

    }

    async refundPayment(paymentData: Record<string, unknown>, refundAmount: number): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        
        // TODO

        return {}

    }

    async getPaymentStatus(paymentSessionData: Record<string, unknown>): Promise<PaymentSessionStatus> {

        // TODO

        return "pending"
    }

    async retrievePayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        
        // TODO

        return {}

    }

    async updatePayment(context: UpdatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
        
        // TODO

        return {
            data: {}
        }

    }

    async getWebhookActionAndData(data: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
        
        // TODO

        return {
            action: "not_supported"
        }

    }

}

export default CoinbaseCommercePaymentProviderService