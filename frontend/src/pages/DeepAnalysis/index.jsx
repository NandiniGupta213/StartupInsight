import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';

// material-ui imports
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

// project imports
import MainCard from 'components/MainCard';

// assets
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import AimOutlined from '@ant-design/icons/AimOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import HourglassOutlined from '@ant-design/icons/HourglassOutlined';
import FundOutlined from '@ant-design/icons/FundOutlined';
import BulbOutlined from '@ant-design/icons/BulbOutlined';
import RocketOutlined from '@ant-design/icons/RocketOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ThunderboltOutlined from '@ant-design/icons/ThunderboltOutlined';
import StockOutlined from '@ant-design/icons/StockOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import TrophyOutlined from '@ant-design/icons/TrophyOutlined';

// Chart imports
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell,
  Legend
} from 'recharts';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

const COLORS = ['#00E676', '#2196F3', '#FF9800', '#FF5252', '#FFD700', '#9C27B0'];

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trend-tabpanel-${index}`}
      aria-labelledby={`trend-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to convert to INR
const convertToINR = (value) => {
  if (!value) return value;
  if (value.includes('₹')) return value;
  
  const dollarMatch = value.match(/\$(\d+(?:\.\d+)?)\s*([BM])?/);
  if (dollarMatch) {
    const num = parseFloat(dollarMatch[1]);
    const multiplier = dollarMatch[2] === 'B' ? 1000 : dollarMatch[2] === 'M' ? 1 : 1;
    const inrValue = num * 83 * multiplier;
    if (inrValue >= 1000) {
      return `₹${(inrValue / 1000).toFixed(1)}T`;
    }
    return `₹${inrValue.toFixed(0)}Cr`;
  }
  return value;
};

// Workflow steps
const workflowSteps = [
  {
    label: 'Extracting Information',
    description: 'AI analyzes your industry to extract key trends and segments',
    icon: <BulbOutlined />
  },
  {
    label: 'Generating Embeddings',
    description: 'Converting industry data into vector embeddings for semantic search',
    icon: <DatabaseOutlined />
  },
  {
    label: 'Finding Similar Markets',
    description: 'Searching Pinecone database for similar market trends and patterns',
    icon: <SearchOutlined />
  },
  {
    label: 'Deep Analysis',
    description: 'AI generates comprehensive market analysis with opportunities and risks',
    icon: <ThunderboltOutlined />
  },
  {
    label: 'Final Summary',
    description: 'Creating executive summary with key insights and recommendations',
    icon: <TrophyOutlined />
  }
];

export default function MarketTrendsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery } = useSearch();
  
  // State
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [tabValue, setTabValue] = useState(0);
  const [searchQueryState, setSearchQueryState] = useState('');

  // Workflow state
  const [workflowData, setWorkflowData] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showWorkflow, setShowWorkflow] = useState(false);

  // Auto-fetch market trends when searchQuery changes from context
  useEffect(() => {
    const fetchData = async () => {
      let industry = searchQuery;
      
      if (!industry) {
        const savedIndustry = localStorage.getItem('lastIndustry');
        if (savedIndustry) {
          industry = savedIndustry;
          console.log('🔍 Industry from localStorage:', industry);
        }
      }
      
      if (industry) {
        console.log('✅ Auto-fetching trends for industry:', industry);
        setSearchQueryState(industry);
        setLoading(true);
        
        try {
          const response = await fetch(`${API_BASE_URL}/market/trends`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ industry: industry.trim() })
          });

          const data = await response.json();
          
          if (data.success) {
            setTrendsData(data);
            startWorkflow(industry); // Start workflow in background
            setSnackbar({
              open: true,
              message: data.cached ? '✨ Loaded from cache!' : '✅ Market trends generated!',
              severity: 'success'
            });
            localStorage.setItem('lastIndustry', industry);
          } else {
            setSnackbar({
              open: true,
              message: data.error || 'Failed to fetch trends',
              severity: 'error'
            });
          }
        } catch (error) {
          console.error('Error:', error);
          setSnackbar({
            open: true,
            message: 'Network error. Please try again.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      } else {
        console.log('❌ No industry found');
        setSnackbar({
          open: true,
          message: 'Please search for an industry from the homepage',
          severity: 'info'
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  const startWorkflow = async (industry) => {
    setWorkflowLoading(true);
    setShowWorkflow(true);
    setActiveStep(0);
    
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 4) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 2000);

    try {
      const response = await fetch(`${API_BASE_URL}/workflow/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: industry })
      });

      const data = await response.json();
      
      if (data.success) {
        setWorkflowData(data);
        setActiveStep(5);
        clearInterval(interval);
        
        setSnackbar({
          open: true,
          message: `✅ Deep analysis completed in ${(data.processingTime / 1000).toFixed(1)}s`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Workflow error:', error);
      clearInterval(interval);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleWorkflow = () => {
    setShowWorkflow(!showWorkflow);
  };

  // Prepare chart data
  const prepareGrowthData = () => {
    if (!trendsData) return [];
    const rate = parseFloat(trendsData.trends.industryOverview.growthRate) || 12;
    const baseValue = 1000;
    return [
      { year: '2023', value: baseValue },
      { year: '2024', value: baseValue * (1 + rate/100) },
      { year: '2025', value: baseValue * Math.pow(1 + rate/100, 2) },
      { year: '2026', value: baseValue * Math.pow(1 + rate/100, 3) },
      { year: '2027', value: baseValue * Math.pow(1 + rate/100, 4) }
    ];
  };

  const prepareRegionalData = () => {
    if (!trendsData?.trends.regionalInsights) return [];
    return trendsData.trends.regionalInsights.map(region => ({
      name: region.region,
      value: parseFloat(region.marketSize.replace(/[^0-9.]/g, '')) || 100,
      displayValue: convertToINR(region.marketSize)
    }));
  };

  const preparePieData = () => {
    return [
      { name: 'Market Size', value: 85 },
      { name: 'Growth Rate', value: 75 },
      { name: 'Investment', value: 70 },
      { name: 'Consumer Demand', value: 90 },
      { name: 'Innovation', value: 65 }
    ];
  };

  return (
    <Box sx={{ bgcolor: '#0A0A0A', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ pt: 4, pb: 8 }}>
        
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
         
          <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
            Market Trends Intelligence
          </Typography>
          {searchQueryState && (
            <Chip 
              label={`"${searchQueryState}"`}
              sx={{ 
                bgcolor: 'rgba(0,230,118,0.1)', 
                color: '#00E676',
                border: '1px solid rgba(0,230,118,0.3)'
              }}
            />
          )}
          <Chip 
            label="AI-Powered Insights"
            sx={{ 
              bgcolor: 'rgba(0,230,118,0.1)', 
              color: '#00E676',
              border: '1px solid rgba(0,230,118,0.3)'
            }}
          />

        </Stack>

        {/* Workflow Section */}
        {showWorkflow && (
          <Paper sx={{ p: 4, bgcolor: '#121212', border: '1px solid #00E676', mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#00E676', mb: 3 }}>
              <ThunderboltOutlined sx={{ mr: 1 }} />
              LangChain + Pinecone Deep Analysis
            </Typography>
            
            {workflowLoading ? (
              <Stepper activeStep={activeStep} orientation="vertical">
                {workflowSteps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Avatar sx={{ 
                          bgcolor: index <= activeStep ? '#00E676' : '#2A2A2A',
                          color: index <= activeStep ? '#000000' : '#FFFFFF',
                          width: 32,
                          height: 32
                        }}>
                          {step.icon}
                        </Avatar>
                      )}
                    >
                      <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                        {step.description}
                      </Typography>
                      {index === activeStep && (
                        <LinearProgress sx={{ 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': { bgcolor: '#00E676' },
                          height: 4,
                          borderRadius: 2,
                          mb: 2
                        }} />
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            ) : workflowData ? (
              <Box>
                {/* Processing Time */}
                <Paper sx={{ p: 2, bgcolor: 'rgba(0,230,118,0.05)', mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <HourglassOutlined style={{ color: '#00E676' }} />
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        Processing Time
                      </Typography>
                    </Stack>
                    <Chip 
                      label={`${(workflowData.processingTime / 1000).toFixed(1)} seconds`}
                      sx={{ bgcolor: 'rgba(0,230,118,0.1)', color: '#00E676' }}
                    />
                  </Stack>
                </Paper>

                {/* Extracted Information */}
                {workflowData.extractedInfo && (
                  <MainCard sx={{ bgcolor: '#121212', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#00E676', mb: 2 }}>
                      <BulbOutlined sx={{ mr: 1 }} />
                      Extracted Information
                    </Typography>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: 'rgba(0,230,118,0.05)' }}>
                          <Typography variant="subtitle2" sx={{ color: '#00E676' }}>
                            Industry
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                            {workflowData.extractedInfo.industry} / {workflowData.extractedInfo.subCategory}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: 'rgba(33,150,243,0.05)' }}>
                          <Typography variant="subtitle2" sx={{ color: '#2196F3' }}>
                            Business Model
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                            {workflowData.extractedInfo.businessModel}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
                          <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>
                            Keywords
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {workflowData.extractedInfo.keywords?.map((kw, idx) => (
                              <Chip 
                                key={idx}
                                label={kw}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,215,0,0.1)', color: '#FFD700' }}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
                          <Typography variant="subtitle2" sx={{ color: '#00E676', mb: 1 }}>
                            Target Market
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                            {workflowData.extractedInfo.targetMarket}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </MainCard>
                )}

                {/* Similar Markets */}
                {workflowData.similarStartups && workflowData.similarStartups.length > 0 && (
                  <MainCard sx={{ bgcolor: '#121212', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#2196F3', mb: 2 }}>
                      <DatabaseOutlined sx={{ mr: 1 }} />
                      Similar Markets from Pinecone
                    </Typography>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      {workflowData.similarStartups.slice(0, 3).map((startup, idx) => (
                        <Grid item xs={12} md={4} key={idx}>
                          <Paper sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(33,150,243,0.05)',
                            borderLeft: '3px solid #2196F3'
                          }}>
                            <Typography variant="subtitle1" sx={{ color: '#FFFFFF' }}>
                              {startup.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                              {startup.description}
                            </Typography>
                            <Chip 
                              label={`${(startup.similarity * 100).toFixed(0)}% match`}
                              size="small"
                              sx={{ mt: 1, bgcolor: 'rgba(33,150,243,0.1)', color: '#2196F3' }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </MainCard>
                )}
              </Box>
            ) : null}
          </Paper>
        )}

        {/* Loading State */}
        {loading && (
          <Paper sx={{ p: 6, bgcolor: '#121212', textAlign: 'center' }}>
            <HourglassOutlined style={{ fontSize: '3rem', color: '#00E676', marginBottom: 16 }} />
            <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 2 }}>
              Analyzing Market Trends {searchQueryState && `for "${searchQueryState}"`}
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
              <LinearProgress 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#00E676' },
                  height: 6,
                  borderRadius: 3
                }}
              />
            </Box>
          </Paper>
        )}

        {/* Market Trends Dashboard */}
        {!loading && trendsData && (
          <Fade in={true}>
            <Box>
              {/* Industry Header */}
              <Paper sx={{ p: 4, bgcolor: '#121212', border: '1px solid #00E676', mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#00E676', width: 70, height: 70 }}>
                        <StockOutlined style={{ fontSize: '2rem', color: '#000000' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h3" sx={{ color: '#00E676', fontWeight: 700 }}>
                          {trendsData.industryCategory}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                          {trendsData.industry}
                        </Typography>
                        
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, bgcolor: 'rgba(0,230,118,0.05)', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#00E676' }}>Market CAGR</Typography>
                      <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                        {convertToINR(trendsData.trends.keyMetrics?.cagr) || '12.5%'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* Tabs Navigation */}
              <Paper sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A', mb: 4 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 600, minWidth: 120 },
                    '& .Mui-selected': { color: '#00E676 !important' },
                    '& .MuiTabs-indicator': { bgcolor: '#00E676' }
                  }}
                >
                  <Tab label="Overview" />
                  <Tab label="Consumer Trends" />
                  <Tab label="Investment" />
                  <Tab label="Regional" />
                  <Tab label="Opportunities" />
                </Tabs>
              </Paper>

              {/* Tab Panels - Your existing tabs remain exactly the same */}
              <TabPanel value={tabValue} index={0}>
                <Grid  spacing={3}>
                  {/* Growth Chart */}
                  <Grid item xs={12}>
                    <MainCard sx={{ bgcolor: '#121212' }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                        <RiseOutlined style={{ marginRight: 8, color: '#00E676' }} />
                        Market Growth Projection (₹ Cr)
                      </Typography>
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                      <Box sx={{ height: 400, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={prepareGrowthData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00E676" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="year" stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} />
                            <YAxis stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#00E676', borderRadius: 8 }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#00E676" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorValue)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </MainCard>
                  </Grid>

                  {/* Pie Chart */}
                  <Grid item xs={12} md={6}>
                    <MainCard sx={{ bgcolor: '#121212' }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                        <PieChartOutlined style={{ marginRight: 8, color: '#00E676' }} />
                        Market Distribution
                      </Typography>
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                      <Box sx={{ height: 350, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                            <Pie
                              data={preparePieData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={{ stroke: '#aaa', strokeWidth: 1 }}
                            >
                              {preparePieData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#00E676', borderRadius: 8 }}
                              labelStyle={{ color: '#fff' }}
                              formatter={(value) => [`${value}%`, 'Score']}
                            />
                            <Legend 
                              wrapperStyle={{ color: '#fff' }}
                              iconType="circle"
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </MainCard>
                  </Grid>

                  {/* Key Metrics */}
                  <Grid item xs={12} md={6}>
                    <MainCard sx={{ bgcolor: '#121212' }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                        Key Market Metrics
                      </Typography>
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 3, bgcolor: 'rgba(0,230,118,0.05)', textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#00E676' }}>Market Size</Typography>
                            <Typography variant="h5" sx={{ color: '#FFFFFF', mt: 1 }}>
                              {convertToINR(trendsData.trends.industryOverview.marketSize)}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 3, bgcolor: 'rgba(33,150,243,0.05)', textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#2196F3' }}>Growth Rate</Typography>
                            <Typography variant="h5" sx={{ color: '#FFFFFF', mt: 1 }}>
                              {trendsData.trends.industryOverview.growthRate}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12}>
                          <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)' }}>
                            <Typography variant="caption" sx={{ color: '#aaa' }}>Key Drivers</Typography>
                            <List dense>
                              {trendsData.trends.industryOverview.keyDrivers?.slice(0, 3).map((driver, idx) => (
                                <ListItem key={idx} sx={{ px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 28 }}>
                                    <CheckCircleOutlined style={{ color: '#00E676', fontSize: '1rem' }} />
                                  </ListItemIcon>
                                  <ListItemText primary={driver} sx={{ '& .MuiTypography-root': { color: '#FFFFFF' } }} />
                                </ListItem>
                              ))}
                            </List>
                          </Paper>
                        </Grid>
                      </Grid>
                    </MainCard>
                  </Grid>

                  {/* Outlook */}
                  <Grid item xs={12}>
                    <MainCard sx={{ bgcolor: '#121212', border: '1px solid #00E676' }}>
                      <Typography variant="h6" sx={{ color: '#00E676', mb: 2 }}>
                        <BulbOutlined /> Market Outlook
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
                        {trendsData.trends.industryOverview.outlook}
                      </Typography>
                    </MainCard>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Consumer Trends Panel */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  {trendsData.trends.consumerTrends?.map((trend, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <MainCard sx={{ 
                        bgcolor: '#121212',
                        border: `1px solid ${trend.impact === 'High' ? '#00E676' : trend.impact === 'Medium' ? '#FF9800' : '#2196F3'}`,
                        height: '100%'
                      }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: trend.impact === 'High' ? 'rgba(0,230,118,0.1)' : 
                                    trend.impact === 'Medium' ? 'rgba(255,152,0,0.1)' : 'rgba(33,150,243,0.1)'
                          }}>
                            <RiseOutlined style={{ 
                              color: trend.impact === 'High' ? '#00E676' : 
                                     trend.impact === 'Medium' ? '#FF9800' : '#2196F3'
                            }} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                              {trend.trend}
                            </Typography>
                            <Chip 
                              label={`Impact: ${trend.impact}`}
                              size="small"
                              sx={{ 
                                mt: 0.5,
                                bgcolor: trend.impact === 'High' ? 'rgba(0,230,118,0.1)' : 
                                        trend.impact === 'Medium' ? 'rgba(255,152,0,0.1)' : 'rgba(33,150,243,0.1)',
                                color: trend.impact === 'High' ? '#00E676' : 
                                       trend.impact === 'Medium' ? '#FF9800' : '#2196F3'
                              }}
                            />
                          </Box>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {trend.description}
                        </Typography>
                      </MainCard>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              {/* Investment Panel */}
              <TabPanel value={tabValue} index={2}>
                <Grid  spacing={3}>
                  {/* Investment Overview Cards */}
                  <Grid item xs={12} md={3}>
                    <MainCard sx={{ bgcolor: '#121212', textAlign: 'center' }}>
                      <DollarOutlined style={{ fontSize: '2rem', color: '#00E676', mb: 1 }} />
                      <Typography variant="caption" sx={{ color: '#aaa' }}>Total Funding</Typography>
                      <Typography variant="h5" sx={{ color: '#FFFFFF', mt: 1 }}>
                        {convertToINR(trendsData.trends.investmentTrends.totalFunding)}
                      </Typography>
                    </MainCard>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MainCard sx={{ bgcolor: '#121212', textAlign: 'center' }}>
                      <StockOutlined style={{ fontSize: '2rem', color: '#2196F3', mb: 1 }} />
                      <Typography variant="caption" sx={{ color: '#aaa' }}>Avg Deal Size</Typography>
                      <Typography variant="h5" sx={{ color: '#FFFFFF', mt: 1 }}>
                        {convertToINR(trendsData.trends.investmentTrends.averageDealSize)}
                      </Typography>
                    </MainCard>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MainCard sx={{ bgcolor: '#121212' }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>Hot Segments</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {trendsData.trends.investmentTrends.hotSegments?.map((segment, idx) => (
                          <Chip 
                            key={idx}
                            label={segment}
                            sx={{ 
                              bgcolor: 'rgba(0,230,118,0.1)',
                              color: '#00E676',
                              border: '1px solid rgba(0,230,118,0.3)',
                              fontSize: '0.9rem',
                              py: 2
                            }}
                          />
                        ))}
                      </Box>
                    </MainCard>
                  </Grid>

                  {/* Active Investors */}
                  <Grid item xs={12}>
                    <MainCard sx={{ bgcolor: '#121212' }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                        <TeamOutlined style={{ marginRight: 8, color: '#00E676' }} />
                        Active Investors
                      </Typography>
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {trendsData.trends.investmentTrends.activeInvestors?.map((investor, idx) => (
                          <Chip 
                            key={idx}
                            label={investor}
                            sx={{ 
                              bgcolor: 'rgba(33,150,243,0.1)',
                              color: '#2196F3',
                              border: '1px solid rgba(33,150,243,0.3)',
                              fontSize: '0.9rem',
                              m: 0.5
                            }}
                          />
                        ))}
                      </Box>
                    </MainCard>
                  </Grid>

                  {/* Notable Deals */}
                  <Grid item xs={12}>
                    <MainCard sx={{ bgcolor: '#121212' }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                        <FundOutlined style={{ marginRight: 8, color: '#00E676' }} />
                        Notable Deals
                      </Typography>
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ color: '#00E676' }}>Startup</TableCell>
                              <TableCell sx={{ color: '#00E676' }}>Amount</TableCell>
                              <TableCell sx={{ color: '#00E676' }}>Investors</TableCell>
                              <TableCell sx={{ color: '#00E676' }}>Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {trendsData.trends.investmentTrends.notableDeals?.map((deal, idx) => (
                              <TableRow key={idx}>
                                <TableCell sx={{ color: '#FFFFFF' }}>{deal.startup}</TableCell>
                                <TableCell sx={{ color: '#00E676', fontWeight: 600 }}>
                                  {convertToINR(deal.amount)}
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {deal.investors?.map((inv, i) => (
                                      <Chip 
                                        key={i}
                                        label={inv}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(33,150,243,0.1)', color: '#2196F3' }}
                                      />
                                    ))}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{deal.date}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </MainCard>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Regional Insights Panel */}
              <TabPanel value={tabValue} index={3}>
                <Grid  spacing={3}>
                  {/* Regional Bar Chart */}
                  <Grid item xs={12}>
                    <MainCard sx={{ bgcolor: '#121212' }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                        <GlobalOutlined style={{ marginRight: 8, color: '#00E676' }} />
                        Regional Market Size Comparison (₹ Cr)
                      </Typography>
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                      <Box sx={{ height: 400, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={prepareRegionalData()} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            barSize={40}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} interval={0} />
                            <YAxis stroke="#aaa" tick={{ fill: '#aaa', fontSize: 12 }} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#00E676' }}
                              labelStyle={{ color: '#fff' }}
                              formatter={(value) => [`₹${value} Cr`, 'Market Size']}
                            />
                            <Bar dataKey="value" fill="#00E676" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </MainCard>
                  </Grid>

                  {/* Regional Details */}
                  {trendsData.trends.regionalInsights?.map((region, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <MainCard sx={{ bgcolor: '#121212' }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                          <Avatar sx={{ bgcolor: idx === 0 ? 'rgba(0,230,118,0.1)' : 'rgba(33,150,243,0.1)' }}>
                            {idx === 0 ? <AimOutlined style={{ color: '#00E676' }} /> : <GlobalOutlined style={{ color: '#2196F3' }} />}
                          </Avatar>
                          <Typography variant="h5" sx={{ color: idx === 0 ? '#00E676' : '#2196F3' }}>
                            {region.region}
                          </Typography>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
                              <Typography variant="caption" sx={{ color: '#aaa' }}>Market Size</Typography>
                              <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                                {convertToINR(region.marketSize)}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={6}>
                            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
                              <Typography variant="caption" sx={{ color: '#aaa' }}>Growth Rate</Typography>
                              <Typography variant="h6" sx={{ color: '#00E676' }}>{region.growthRate}</Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 2 }}>Key Players</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {region.keyPlayers?.map((player, i) => (
                                <Chip 
                                  key={i}
                                  label={player}
                                  sx={{ 
                                    bgcolor: 'rgba(0,230,118,0.1)',
                                    color: '#00E676',
                                    border: '1px solid rgba(0,230,118,0.3)'
                                  }}
                                />
                              ))}
                            </Box>
                          </Grid>
                        </Grid>
                      </MainCard>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              {/* Opportunities Panel */}
              <TabPanel value={tabValue} index={4}>
                <Grid container spacing={3}>
                  {trendsData.trends.emergingOpportunities?.map((opp, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <MainCard sx={{ 
                        bgcolor: '#121212',
                        border: `1px solid ${opp.potential === 'High' ? '#00E676' : opp.potential === 'Medium' ? '#FF9800' : '#2196F3'}`,
                        height: '100%'
                      }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: opp.potential === 'High' ? 'rgba(0,230,118,0.1)' : 
                                    opp.potential === 'Medium' ? 'rgba(255,152,0,0.1)' : 'rgba(33,150,243,0.1)'
                          }}>
                            <RocketOutlined style={{ 
                              color: opp.potential === 'High' ? '#00E676' : 
                                     opp.potential === 'Medium' ? '#FF9800' : '#2196F3'
                            }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                              {opp.opportunity}
                            </Typography>
                            <Chip 
                              label={`Potential: ${opp.potential}`}
                              size="small"
                              sx={{ 
                                mt: 0.5,
                                bgcolor: opp.potential === 'High' ? 'rgba(0,230,118,0.1)' : 
                                        opp.potential === 'Medium' ? 'rgba(255,152,0,0.1)' : 'rgba(33,150,243,0.1)',
                                color: opp.potential === 'High' ? '#00E676' : 
                                       opp.potential === 'Medium' ? '#FF9800' : '#2196F3'
                              }}
                            />
                          </Box>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                          {opp.description}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 1 }}>Example Startups:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {opp.exampleStartups?.map((startup, i) => (
                            <Chip 
                              key={i}
                              label={startup}
                              size="small"
                              sx={{ bgcolor: 'rgba(33,150,243,0.1)', color: '#2196F3' }}
                            />
                          ))}
                        </Box>
                      </MainCard>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
            </Box>
          </Fade>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity}
            onClose={handleCloseSnackbar}
            sx={{ 
              bgcolor: snackbar.severity === 'success' ? '#1B5E1F' : 
                      snackbar.severity === 'error' ? '#B71C1C' : '#FF6F00',
              color: '#FFFFFF'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}