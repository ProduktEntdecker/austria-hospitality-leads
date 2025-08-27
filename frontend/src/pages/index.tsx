import React from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hotel, 
  MapPin, 
  TrendingUp, 
  Database,
  Bot,
  Filter,
  Download
} from 'lucide-react';
import { useLeadStats } from '@/hooks/use-lead-stats';
import { LeadTable } from '@/components/leads/lead-table';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QualityChart } from '@/components/dashboard/quality-chart';

export default function DashboardPage() {
  const { data: stats, isLoading } = useLeadStats();

  return (
    <>
      <Head>
        <title>Austria Hospitality Leads - Dashboard</title>
        <meta name=\"description\" content=\"B2B lead generation for Austrian hotel and restaurant interior design market\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
        <link rel=\"icon\" href=\"/favicon.ico\" />
      </Head>

      <div className=\"min-h-screen bg-gray-50\">
        <header className=\"bg-white shadow-sm border-b\">
          <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
            <div className=\"flex justify-between items-center h-16\">
              <div className=\"flex items-center space-x-4\">
                <Hotel className=\"h-8 w-8 text-blue-600\" />
                <div>
                  <h1 className=\"text-xl font-semibold text-gray-900\">
                    Austria Hospitality Leads
                  </h1>
                  <p className=\"text-sm text-gray-500\">
                    Interior Design Lead Generation
                  </p>
                </div>
              </div>
              
              <div className=\"flex items-center space-x-4\">
                <Badge variant=\"secondary\" className=\"flex items-center space-x-1\">
                  <MapPin className=\"h-3 w-3\" />
                  <span>Austria</span>
                </Badge>
                <Button variant=\"outline\" size=\"sm\">
                  <Download className=\"h-4 w-4 mr-2\" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
          {/* Stats Overview */}
          <div className=\"mb-8\">
            <div className=\"flex justify-between items-center mb-6\">
              <div>
                <h2 className=\"text-2xl font-bold text-gray-900\">Dashboard</h2>
                <p className=\"text-gray-600 mt-1\">
                  Austrian hotel & restaurant lead generation overview
                </p>
              </div>
              <div className=\"flex space-x-2\">
                <Button variant=\"outline\" size=\"sm\">
                  <Filter className=\"h-4 w-4 mr-2\" />
                  Filter
                </Button>
                <Button size=\"sm\">
                  <Bot className=\"h-4 w-4 mr-2\" />
                  Run AI Enrichment
                </Button>
              </div>
            </div>
            
            <StatsCards stats={stats} isLoading={isLoading} />
          </div>

          {/* Main Content Grid */}
          <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8\">
            {/* Lead Quality Chart */}
            <Card className=\"lg:col-span-2\">
              <CardHeader>
                <CardTitle className=\"flex items-center space-x-2\">
                  <TrendingUp className=\"h-5 w-5\" />
                  <span>Lead Quality Trends</span>
                </CardTitle>
                <CardDescription>
                  Quality scores and conversion rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QualityChart />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center space-x-2\">
                  <Database className=\"h-5 w-5\" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest lead updates and system activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>

          {/* Lead Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                View and manage Austrian hospitality leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadTable />
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}