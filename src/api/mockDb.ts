import { Company, User, Product, Scenario } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const mockCompanies: Company[] = [
    { id: 'comp_1', name: 'Sipper Natural Foods' },
    { id: 'comp_2', name: 'Demo Distributors LLC' }
];

export const mockUsers: User[] = [
    { id: 'usr_sa1', email: 'Bill@cascadiafoodbev.com', role: 'super_admin', companyId: 'comp_sys', hasAcceptedTerms: false },
    { id: 'usr_sa2', email: 'adrian@marginminder.com', role: 'super_admin', companyId: 'comp_sys', hasAcceptedTerms: false },
    { id: 'usr_admin', email: 'admin@sipper.com', role: 'admin', companyId: 'comp_1', hasAcceptedTerms: false },
    { id: 'usr_dist', email: 'distributor@demo.com', role: 'distributor', companyId: 'comp_2', hasAcceptedTerms: false },
    { id: 'usr_ret', email: 'buyer@retailer.com', role: 'retailer', companyId: 'comp_1', hasAcceptedTerms: false } // Shared access for viewing
];

export const mockProducts: Product[] = [
    { id: 'prod_1', companyId: 'comp_1', name: 'Original Walnuts', sku: 'WAL-100', casePack: 12, sizeOunces: '8oz' },
    { id: 'prod_2', companyId: 'comp_1', name: 'Roasted Peanuts', sku: 'PEA-200', casePack: 24, sizeOunces: '16oz' },
];

export class MockDB {
    static getCompanies(): Company[] {
        const data = localStorage.getItem('db_companies');
        return data ? JSON.parse(data) : mockCompanies;
    }

    static getUsers(): User[] {
        const data = localStorage.getItem('db_users');
        return data ? JSON.parse(data) : mockUsers;
    }

    static saveCompany(c: Company) {
        const data = localStorage.getItem('db_companies');
        let allComps: Company[] = data ? JSON.parse(data) : mockCompanies;
        const idx = allComps.findIndex(x => x.id === c.id);
        if (idx >= 0) allComps[idx] = c;
        else allComps.push(c);
        localStorage.setItem('db_companies', JSON.stringify(allComps));
    }

    static deleteCompany(id: string) {
        const data = localStorage.getItem('db_companies');
        let allComps: Company[] = data ? JSON.parse(data) : mockCompanies;
        allComps = allComps.filter(c => c.id !== id);
        localStorage.setItem('db_companies', JSON.stringify(allComps));
    }

    static saveUser(u: User) {
        const data = localStorage.getItem('db_users');
        let allUsers: User[] = data ? JSON.parse(data) : mockUsers;
        const idx = allUsers.findIndex(x => x.id === u.id);
        if (idx >= 0) allUsers[idx] = u;
        else allUsers.push(u);
        localStorage.setItem('db_users', JSON.stringify(allUsers));
    }

    static deleteUser(id: string) {
        const data = localStorage.getItem('db_users');
        let allUsers: User[] = data ? JSON.parse(data) : mockUsers;
        allUsers = allUsers.filter(u => u.id !== id);
        localStorage.setItem('db_users', JSON.stringify(allUsers));
    }

    static getProducts(companyId?: string): Product[] {
        const data = localStorage.getItem('db_products');
        const allProds: Product[] = data ? JSON.parse(data) : mockProducts;
        return companyId ? allProds.filter(p => p.companyId === companyId) : allProds;
    }

    static saveProduct(p: Product) {
        const data = localStorage.getItem('db_products');
        let allProds: Product[] = data ? JSON.parse(data) : mockProducts;
        const idx = allProds.findIndex(x => x.id === p.id);
        if (idx >= 0) allProds[idx] = p;
        else allProds.push(p);
        localStorage.setItem('db_products', JSON.stringify(allProds));
    }

    static deleteProduct(id: string) {
        const data = localStorage.getItem('db_products');
        let allProds: Product[] = data ? JSON.parse(data) : mockProducts;
        allProds = allProds.filter(p => p.id !== id);
        localStorage.setItem('db_products', JSON.stringify(allProds));
    }
}
