import { Logger, ConfigModule } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { CoinbaseClientOptions, CreateChargeInput, ChargeResponse, ChargeId, Status } from "../types"
import axios from "axios"
import { createHmac } from 'crypto';

type InjectedDependencies = {
    logger: Logger,
    configModule: ConfigModule
}

class SignatureVerificationError extends Error {
    sigHeader: string;
    httpBody: string;

    constructor(message: string, sigHeader: string, httpBody: string) {
        super(message);
        this.sigHeader = sigHeader;
        this.httpBody = httpBody;
        this.name = 'SignatureVerificationError';
    }
}

export class CoinbaseClient {
    private options_: CoinbaseClientOptions
    private logger_: Logger
    
    constructor({ logger, configModule }: InjectedDependencies) {
        this.logger_ = logger

        const moduleDef = configModule.modules[Modules.PAYMENT]
        if (typeof moduleDef !== "boolean") {
            this.options_ = moduleDef.options as CoinbaseClientOptions
        } else {
            throw new Error("Payment module configuration is invalid")
        }
    }

    async createCharge(charge: CreateChargeInput): Promise<ChargeResponse> {
        try {
            const response = await axios.post<ChargeResponse>(
                'https://api.commerce.coinbase.com/charges',
                charge,
                {
                    headers: {
                        'X-CC-Api-Key': this.options_.apiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            )

            this.logger_.info("Charge created.")
            return response.data

        } catch (error) {
            if (axios.isAxiosError(error)) {
                this.logger_.error("Error creating charge.")
                throw error
            }
            throw new Error("Unexpected error creating charge")
        }
    }

    async retrieveCharge(chargeId: ChargeId): Promise<ChargeResponse> {
        try {
            const response = await axios.get<ChargeResponse>(
                `https://api.commerce.coinbase.com/charges/${chargeId}`,
                {
                    headers: {
                        'X-CC-Api-Key': this.options_.apiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            )

            this.logger_.info(`Getting charge with id: ${chargeId}`)
            return response.data

        } catch (error) {
            if (axios.isAxiosError(error)) {
                this.logger_.error("Error retrieving charge")
                throw error
            }
            throw new Error("Unexpected error retrieving charge")
        }
    }

    async getChargeStatus(chargeId: ChargeId): Promise<Status> {

        try {
    
            const charge = await this.retrieveCharge(chargeId)
            const event = charge.timeline.pop() // The most recent event.
            
            this.logger_.info("Charge status retrieved.")
            return event.status
        
        } catch(error) {
            if (axios.isAxiosError(error)) {
                this.logger_.error("Error retrieving charge status")
                throw error
            }
            throw new Error("Unexpected error retrieving charge status")
        }

    }

    private secureCompare(a: string, b: string): boolean {
       
        if (a.length !== b.length) {
            return false;
        }
    
        let res = 0;
        for (let i = 0; i < a.length; i++) {
            res |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
    
        return res === 0;
    }

    private computeSignature(payload: string, secret: string): string {
        return createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
    }

    verifyHeader(payload: string, sigHeader: string, secret: string): boolean {
        if (!payload || !sigHeader || !secret) {
            throw new SignatureVerificationError(
                "Missing payload or signature", 
                sigHeader, 
                payload
            );
        }
    
        const expectedSig = this.computeSignature(payload, secret);
    
        if (!this.secureCompare(expectedSig, sigHeader)) {
            throw new SignatureVerificationError(
                "No signatures found matching the expected signature for payload",
                sigHeader, 
                payload
            );
        }
    
        return true;
    }

}
