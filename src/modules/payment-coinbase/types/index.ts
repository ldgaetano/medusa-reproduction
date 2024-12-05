export type CoinbaseClientOptions = {
    apiKey: string
}

export interface CreateChargeInput {
    buyer_locale?: string,
    cancel_url?: string,
    checkout_id?: string,
    local_price: {
        amount: string,
        currency: string
    },
    metadata?: Record<string, string>,
    pricing_type: PricingType,
    redirect_url?: string
}

export interface ChargeResponse {
    brand_color: string,
    brand_logo_url: string,
    charge_kind: ChargeKind,
    checkout: {
        id: string
    },
    code: string,
    confirmed_at: string,
    created_at: string,
    description: string,
    expires_at: string,
    hosted_url: string,
    id: string,
    name: string,
    organization_name: string,
    pricing: {
        local: {
            amount: string,
            currency: string
        },
        settlement: {
            amount: string,
            currency: string
        }
    },
    pricing_type: PricingType,
    redirects: {
        cancel_url: string,
        success_url: string,
        will_redirect_after_success: boolean
    },
    support_email: string,
    third_party_provider: string,
    timeline: {
        status: Status,
        time: string 
    }[],
    web3_data: {
        failure_events: {
            input_token_address: string,
            network_fee_paid: string,
            reason: string,
            sender: string,
            timestamp: string,
            tx_hsh: string
        }[],
        success_events: {
            finalized: boolean,
            input_token_address: string,
            input_token_amount: string,
            network_fee_paid: string,
            recipient: string,
            sender: string,
            timestamp: string,
            tx_hsh: string
        }[],
        transfer_intent: {
            call_data: {
                deadline: string,
                fee_amount: string,
                id: string,
                operator: string,
                prefix: string,
                recipient: string,
                recipient_amount: string,
                recipient_currency: string,
                refund_destination: string,
                signature: string
            },
            metadata: {
                chain_id: number,
                contract_address: string,
                sender: string
            }
        },
        contract_address: string,
        contract_addresses: Record<any, any> | null
    }

}

export interface AuthErrorResponse {
    type: string,
    message: string,
    code: string
}

export enum PricingType {
    FixedPrice = "fixed_price",
    NoPrice = "no_price"
}

export enum ChargeKind {
    Web3 = "WEB3"
}

export enum Status {
    Completed = "COMPLETED",
    Expired = "EXPIRED",
    Failed = "FAILED",
    New = "NEW",
    Pending = "PENDING",
    Signed = "SIGNED"
}

export type ChargeId = string