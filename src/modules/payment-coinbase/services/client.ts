import { Logger, ConfigModule } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { CoinbaseClientOptions, CreateChargeInput, ChargeResponse, ChargeId } from "../types"
import axios from "axios"

type InjectedDependencies = {
    logger: Logger,
    configModule: ConfigModule
}

export class CoinbaseClient {

    private options_: CoinbaseClientOptions
    private logger_: Logger
    
    constructor({ logger, configModule }: InjectedDependencies) {
        
        this.logger_ = logger

        const moduleDef = configModule.modules[Modules.PAYMENT]
        if (typeof moduleDef !== "boolean") {
            this.options_ = moduleDef.options as CoinbaseClientOptions
        }

    }

    async createCharge(charge: CreateChargeInput): Promise<ChargeResponse> {

        try {

            const response = await axios.post(
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
            this.logger_.info(response.data)
            return response.data

        } catch (error) {

            this.logger_.error("Error creating charge.")
            this.logger_.error(error)
            throw error

        }
    }

    async retrieveCharge(chargeId: ChargeId): Promise<ChargeResponse> {

        try {

            const response = await axios.get(
                'https://api.commerce.coinbase.com/charges/${chargeId}',
                {
                    headers: {
                        'X-CC-Api-Key': this.options_.apiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            )

            this.logger_.info("Getting charge with id: ${chargeId}.")
            this.logger_.info(response.data)
            return response.data

        } catch (error) {

            this.logger_.error("Error creating charge.")
            this.logger_.error(error)
            throw error

        }

    }

}