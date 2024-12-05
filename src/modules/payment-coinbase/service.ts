import { AbstractPaymentProvider, BigNumber, isPaymentProviderError, MedusaError, PaymentActions, PaymentSessionStatus } from "@medusajs/framework/utils"
import { CreatePaymentProviderSession, Logger, PaymentProviderError, PaymentProviderSessionResponse, PaymentSessionStatus, ProviderWebhookPayload, UpdatePaymentProviderSession, WebhookActionResult } from "@medusajs/framework/types"
import { CoinbaseClient } from "./services"
import { CoinbaseClientOptions, CoinbaseCommerceWebhookEvent, PricingType, Status, WebhookEventType } from "./types"
import { EOL } from "os"

type InjectedDependencies = {
    logger: Logger,
    coinbaseClient: CoinbaseClient
}

type Options = {
    apiKey: string,
    webhookSecret: string
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

    protected buildError(
        message: string,
        error: Error
    ): PaymentProviderError {
        return {
            error: message,
            code: "code" in error ? error.code as string: "unknown",
            detail: isPaymentProviderError(error)
            ? `${error.error}${EOL}${error.detail ?? ""}`
            : "detail" in error
            ? error.detail
            : error.message ?? ""
        }
    }

    static validateOptions(options: Record<any, any>): void | never {
        if (!options.apiKey) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "API Key is required in the payment provider's options."
            )
        }
    }

    async initiatePayment(session: CreatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {

        try {

            const {
                amount,
                currency_code,
                context
            } = session

            const charge = {

                local_price: {
                    amount: amount.toString(),
                    currency: currency_code
                },
                pricing_type: PricingType.FIXED_PRICE,
                metadata: {
                    "payment_session_id": context.session_id
                }

            }

            const response = await this.client.createCharge(charge)

            return {
                ...response,
                data: {
                    id: response.id
                }
            }
        
        } catch (error) {

            return this.buildError(
                "Error initiating payment.",
                error
            )

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

        const chargeId = paymentSessionData.id as string
        const charge = await this.client.retrieveCharge(chargeId)
        const status = await this.getPaymentStatus(paymentSessionData)
        
        if (status === PaymentSessionStatus.CAPTURED ||
            status == PaymentSessionStatus.REQUIRES_MORE
        ) {
            return {
                data: {
                    ...charge,
                    id: chargeId
                },
                status: status
            }
        } else {
            const error = new Error("Invalid charge status.")
            return this.buildError(
                "Invalid payment status for authorization.",
                error
            )
        }

    }

    async capturePayment(
        paymentData: Record<string, unknown>
    ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        
        return paymentData

    }

    async cancelPayment(paymentData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {

        const error = new Error("Cannot cancel charge.")
        return this.buildError(
            "Cannot cancel payment.",
            error
        )

    }

    async deletePayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        
        const error = new Error("Cannot delete charge.")
        return this.buildError(
            "Cannot delete payment.",
            error
        )

    }

    async refundPayment(paymentData: Record<string, unknown>, refundAmount: number): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        
        const error = new Error("Cannot refund charge.")
        return this.buildError(
            "Cannot refund payment.",
            error
        )

    }

    async getPaymentStatus(paymentSessionData: Record<string, unknown>): Promise<PaymentSessionStatus> {

        const chargeId = paymentSessionData.id as string
        const chargeStatus = await this.client.getChargeStatus(chargeId)
        
        switch(chargeStatus) {
            case Status.NEW:
                return PaymentSessionStatus.PENDING
            case Status.SIGNED:
                return PaymentSessionStatus.REQUIRES_MORE
            case Status.PENDING:
                return PaymentSessionStatus.CAPTURED
            case Status.COMPLETED:
                return PaymentSessionStatus.CAPTURED
            case Status.EXPIRED:
                return PaymentSessionStatus.ERROR
            case Status.FAILED:
                return PaymentSessionStatus.ERROR
            default:
                return PaymentSessionStatus.PENDING
            
        }

    }

    async retrievePayment(paymentSessionData: Record<string, unknown>): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
        
        try {

            const chargeId = paymentSessionData.id as string
            const charge = await this.client.retrieveCharge(chargeId)
            return charge as unknown as PaymentProviderSessionResponse["data"]

        } catch (error) {
            return this.buildError(
                "Error retrieving payment.",
                error
            )
        }

    }

    async updatePayment(context: UpdatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
        
        const error = new Error("Cannot udpate charge.")
        return this.buildError(
            "Cannot update payment.",
            error
        )

    }

    async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
        
        try {

            const event = this.constructWebhookEvent(payload)

            switch(event.event.type) {
                case WebhookEventType.EVENT_CREATED:
                    return {
                        action: PaymentActions.NOT_SUPPORTED
                    }
                case WebhookEventType.EVENT_PENDING:
                    return {
                        action: PaymentActions.SUCCESSFUL
                    }
                case WebhookEventType.EVENT_CONFIRMED:
                    return {
                        action: PaymentActions.SUCCESSFUL
                    }
                case WebhookEventType.EVENT_FAILED:
                    return {
                        action: PaymentActions.FAILED
                    }
                default:
                    return {
                        action: PaymentActions.NOT_SUPPORTED
                    }
            }

        } catch (error) {
            return {
                action: PaymentActions.FAILED,
                data: {
                    session_id: (payload.data.metadata as Record<string, any>).payment_session_id,
                    amount: new BigNumber(payload.data.amount as number)
                }
            }
        }

    }

    constructWebhookEvent(payload: ProviderWebhookPayload["payload"]): CoinbaseCommerceWebhookEvent {

        const {
            data,
            rawData,
            headers
        } = payload

        const signature = headers["X-CC-Webhook-Signature"] as string

        const isVerified = this.client.verifyHeader(rawData as string, signature, this.options_.webhookSecret)
        
        return data as unknown as CoinbaseCommerceWebhookEvent

    }

}

export default CoinbaseCommercePaymentProviderService