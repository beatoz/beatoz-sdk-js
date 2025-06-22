import { Web3BaseWallet } from '@beatoz/web3-types';
import { Web3Account } from './types'
import { web3AccountProvider, privateKeyToAccount } from './account'

class Web3Wallets extends Web3BaseWallet<Web3Account> {
     public create(numberOfAccounts: number): this {
        throw new Error('create method not implemented');
    }

    public add(account: Web3Account | string): this {
        let acct: Web3Account;
        if (typeof account === 'string') {
            acct = privateKeyToAccount(account);
        } else {
            acct = account;
        }
        this.push(acct);
        return this;
    }

    public get(addressOrIndex: string | number): Web3Account | undefined {
        if (typeof addressOrIndex === 'number') {
            return this[addressOrIndex];
        } else {
            let addr:string = addressOrIndex as string
            if (addr.startsWith('0x')) {
                addr =  addr.substring(2);
            }
            return this.find(acc => acc.address.toLowerCase() === addr.toLowerCase());
        }
    }

    public remove(addressOrIndex: string | number): boolean {
        let idx: number = -1;
        if (typeof addressOrIndex === 'number') {
            idx = addressOrIndex;
        } else {
            idx = this.findIndex(acc => acc.address.toLowerCase() === addressOrIndex.toLowerCase());
        }
        if (idx >= 0 && idx < this.length) {
            this.splice(idx, 1);
            return true;
        }
        return false;
    }

    public clear(): this {
        this.length = 0;
        return this;
    }

    public async encrypt(password: string, options?: Record<string, unknown>): Promise<any[]> {
        // Placeholder: actual implementation should encrypt each account
        // and return an array of KeyStore objects
        throw new Error('encrypt method not implemented');
    }

    public async decrypt(encryptedWallet: any[], password: string, options?: Record<string, unknown>): Promise<this> {
        // Placeholder: actual implementation should decrypt each keystore
        // and populate this wallet with accounts
        throw new Error('decrypt method not implemented');
    }

    public async save(password: string, keyName?: string): Promise<boolean | never> {
        // Placeholder: actual implementation should persist the wallet
        throw new Error('save method not implemented');
    }

    public async load(password: string, keyName?: string): Promise<this | never> {
        // Placeholder: actual implementation should load the wallet
        throw new Error('load method not implemented');
    }
}

export const walletManager: Web3Wallets = new Web3Wallets(new web3AccountProvider());