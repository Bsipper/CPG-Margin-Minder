import { Company, User, Product, Scenario } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class MockDB {
    static async getCompanies(): Promise<Company[]> {
        const res = await fetch('/api/companies');
        if (!res.ok) return [];
        return await res.json();
    }

    static async getUsers(): Promise<User[]> {
        const res = await fetch('/api/users');
        if (!res.ok) return [];
        return await res.json();
    }

    static async saveCompany(c: Company): Promise<void> {
        await fetch('/api/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(c)
        });
    }

    static async deleteCompany(id: string): Promise<void> {
        await fetch(`/api/companies/${id}`, { method: 'DELETE' });
    }

    static async saveUser(u: User): Promise<void> {
        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u)
        });
    }

    static async deleteUser(id: string): Promise<void> {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
    }

    static async getProducts(companyId?: string): Promise<Product[]> {
        const url = companyId ? `/api/products/${companyId}` : '/api/products';
        const res = await fetch(url);
        if (!res.ok) return [];
        return await res.json();
    }

    static async saveProduct(p: Product): Promise<void> {
        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p)
        });
    }

    static async deleteProduct(id: string): Promise<void> {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
    }
}

