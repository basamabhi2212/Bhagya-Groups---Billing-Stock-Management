
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppSettings, Product, StockMovement, Estimate, Invoice } from './types';
import { DEFAULT_SETTINGS, GITHUB_DATA_PATHS } from './constants';
import { GithubService } from './services/githubService';
import { DashboardIcon, DocumentIcon, ProductIcon, ReportIcon, SettingsIcon, StockIcon, SunIcon, MoonIcon, SyncIcon } from './components/icons';

// Mock components to avoid file not found errors before they are created.
// In a real scenario, these would be actual component imports.
const Dashboard = ({ products, invoices }: { products: Product[], invoices: Invoice[] }) => <div className="p-4"><h1 className="text-2xl">Dashboard</h1><p>Products: {products.length}</p><p>Invoices: {invoices.length}</p></div>;
const ProductsComponent = ({ products, onSave }: { products: Product[], onSave: (products: Product[]) => void }) => <div className="p-4"><h1 className="text-2xl">Products</h1></div>;
const StockManagement = ({ products, stock, onSave }: { products: Product[], stock: StockMovement[], onSave: (stock: StockMovement[], products: Product[]) => void }) => <div className="p-4"><h1 className="text-2xl">Stock</h1></div>;
const Estimates = ({ products, estimates, onSave }: { products: Product[], estimates: Estimate[], onSave: (estimates: Estimate[]) => void }) => <div className="p-4"><h1 className="text-2xl">Estimates</h1></div>;
const InvoicesComponent = ({ products, invoices, onSave }: { products: Product[], invoices: Invoice[], onSave: (invoices: Invoice[]) => void }) => <div className="p-4"><h1 className="text-2xl">Invoices</h1></div>;
const Reports = ({ products, invoices, stock }: { products: Product[], invoices: Invoice[], stock: StockMovement[] }) => <div className="p-4"><h1 className="text-2xl">Reports</h1></div>;
const Settings = ({ settings, onSave }: { settings: AppSettings, onSave: (settings: AppSettings) => void }) => <div className="p-4"><h1 className="text-2xl">Settings</h1></div>;


const NAV_ITEMS = [
  { name: 'Dashboard', icon: DashboardIcon },
  { name: 'Products', icon: ProductIcon },
  { name: 'Stock', icon: StockIcon },
  { name: 'Estimates', icon: DocumentIcon },
  { name: 'Invoices', icon: DocumentIcon },
  { name: 'Reports', icon: ReportIcon },
  { name: 'Settings', icon: SettingsIcon },
];

const App: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [products, setProducts] = useState<Product[]>([]);
    const [stock, setStock] = useState<StockMovement[]>([]);
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    
    const [currentPage, setCurrentPage] = useState('Dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    const githubService = useMemo(() => {
        if (settings.githubToken && settings.githubRepo) {
            try {
                return new GithubService(settings.githubToken, settings.githubRepo);
            } catch (e) {
                setError((e as Error).message);
                return null;
            }
        }
        return null;
    }, [settings.githubToken, settings.githubRepo]);

    useEffect(() => {
        const localSettings = localStorage.getItem('bhagya-settings');
        if (localSettings) {
            const parsedSettings = JSON.parse(localSettings);
            setSettings(parsedSettings);
            if (parsedSettings.githubToken && parsedSettings.githubRepo) {
                setIsSetupComplete(true);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.theme]);

    const fetchDataFromGithub = useCallback(async () => {
        if (!githubService) {
            setError("GitHub not configured. Please go to Settings.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const [productsData, stockData, estimatesData, invoicesData, settingsData] = await Promise.all([
                githubService.getFile(GITHUB_DATA_PATHS.products),
                githubService.getFile(GITHUB_DATA_PATHS.stock),
                githubService.getFile(GITHUB_DATA_PATHS.estimates),
                githubService.getFile(GITHUB_DATA_PATHS.invoices),
                githubService.getFile(GITHUB_DATA_PATHS.settings),
            ]);

            if(settingsData) setSettings(JSON.parse(settingsData.content));
            if(productsData) setProducts(JSON.parse(productsData.content));
            if(stockData) setStock(JSON.parse(stockData.content));
            if(estimatesData) setEstimates(JSON.parse(estimatesData.content));
            if(invoicesData) setInvoices(JSON.parse(invoicesData.content));
            
        } catch (e) {
            setError(`Failed to fetch data from GitHub: ${(e as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    }, [githubService]);

    useEffect(() => {
        if (isSetupComplete) {
            fetchDataFromGithub();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSetupComplete]);

    const handleSaveSettings = async (newSettings: AppSettings) => {
        setIsSyncing(true);
        try {
            const tempService = new GithubService(newSettings.githubToken, newSettings.githubRepo);
            await tempService.createOrUpdateFile(GITHUB_DATA_PATHS.settings, JSON.stringify(newSettings, null, 2), 'update settings');
            setSettings(newSettings);
            localStorage.setItem('bhagya-settings', JSON.stringify(newSettings));
            setIsSetupComplete(true);
            if (!githubService) { // if this is the first time setting up
                await fetchDataFromGithub(); // fetch other data
            }
            setError(null);
        } catch (e) {
            setError(`Failed to save settings: ${(e as Error).message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const syncToGithub = useCallback(async (path: string, data: any, message: string) => {
        if (!githubService) return;
        setIsSyncing(true);
        try {
            await githubService.createOrUpdateFile(path, JSON.stringify(data, null, 2), message);
        } catch (e) {
            setError(`Sync failed for ${path}: ${(e as Error).message}`);
        } finally {
            setIsSyncing(false);
        }
    }, [githubService]);
    
    const renderPage = () => {
        // Placeholder implementation until real components are available
        switch (currentPage) {
            case 'Dashboard': return <div>Dashboard Page</div>
            case 'Products': return <div>Products Page</div>
            case 'Stock': return <div>Stock Page</div>
            case 'Estimates': return <div>Estimates Page</div>
            case 'Invoices': return <div>Invoices Page</div>
            case 'Reports': return <div>Reports Page</div>
            case 'Settings': return <Settings settings={settings} onSave={handleSaveSettings} />;
            default: return <div>Dashboard</div>;
        }
    };
    
    if (isLoading && isSetupComplete) {
        return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Loading data...</div>;
    }

    if (!isSetupComplete && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <h1 className="text-3xl font-bold mb-4">Welcome to Bhagya Groups Manager</h1>
                    <p className="mb-6">Please configure your GitHub repository in the settings to get started.</p>
                    <Settings settings={settings} onSave={handleSaveSettings} />
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-2">
                    {settings.logoBase64 ? 
                        <img src={settings.logoBase64} alt="Logo" className="h-10 w-auto"/> :
                        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">{settings.companyDetails.name}</h1>
                    }
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.name}
                            onClick={() => setCurrentPage(item.name)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                currentPage === item.name
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
                    <button onClick={() => setSettings(s => ({...s, theme: s.theme === 'light' ? 'dark' : 'light'}))}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        {settings.theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                    <button onClick={fetchDataFromGithub} disabled={isSyncing || isLoading}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
                        <SyncIcon className={isSyncing || isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                        <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>
                )}
                {renderPage()}
            </main>
        </div>
    );
}

export default App;
