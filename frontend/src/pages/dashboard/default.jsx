import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';

// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

// assets
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import StockOutlined from '@ant-design/icons/StockOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import BulbOutlined from '@ant-design/icons/BulbOutlined';
import RocketOutlined from '@ant-design/icons/RocketOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ExperimentOutlined from '@ant-design/icons/ExperimentOutlined';
import TrophyOutlined from '@ant-design/icons/TrophyOutlined';
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import AimOutlined from '@ant-design/icons/AimOutlined';
import FundOutlined from '@ant-design/icons/FundOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import TagOutlined from '@ant-design/icons/TagOutlined';
import ExpandOutlined from '@ant-design/icons/ExpandOutlined';
import ShopOutlined from '@ant-design/icons/ShopOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import HourglassOutlined from '@ant-design/icons/HourglassOutlined';
import ThunderboltOutlined from '@ant-design/icons/ThunderboltOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Workflow steps
const workflowSteps = [
  {
    label: 'Extracting Information',
    description: 'AI analyzes your idea to extract industry, keywords, and market segments',
    icon: <BulbOutlined />
  },
  {
    label: 'Generating Embeddings',
    description: 'Converting your idea into vector embeddings for semantic search',
    icon: <DatabaseOutlined />
  },
  {
    label: 'Finding Similar Startups',
    description: 'Searching Pinecone database for similar startups and competitors',
    icon: <SearchOutlined />
  },
  {
    label: 'Deep Analysis',
    description: 'AI generates comprehensive analysis with market opportunity, risks, and SWOT',
    icon: <ThunderboltOutlined />
  },
  {
    label: 'Final Summary',
    description: 'Creating executive summary with key insights and recommendations',
    icon: <TrophyOutlined />
  }
];

export default function StartupDashboard() {
  const location = useLocation();
  const { searchQuery } = useSearch();
  
  // State for standard analysis
  const [analysis, setAnalysis] = useState(() => {
    const savedAnalysis = localStorage.getItem('startupAnalysis');
    return savedAnalysis ? JSON.parse(savedAnalysis) : null;
  });
  
  // State for workflow
  const [workflowData, setWorkflowData] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showWorkflow, setShowWorkflow] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [error, setError] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Handle analysis from context
  useEffect(() => {
    if (searchQuery) {
      console.log('🔍 Got search query from context:', searchQuery);
      handleAnalyzeIdea(searchQuery);
      startWorkflow(searchQuery); // Start workflow in background
    } else if (!analysis) {
      setError('No idea provided for analysis');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleAnalyzeIdea = async (ideaText) => {
    if (!ideaText?.trim()) {
      setError('Please enter a valid startup idea');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/startup/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaText.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        localStorage.setItem('startupAnalysis', JSON.stringify(data.analysis));
        localStorage.setItem('lastIdea', ideaText.trim());
        
        setSnackbar({
          open: true,
          message: data.cached ? '✨ Analysis loaded from cache!' : '✅ Analysis completed successfully!',
          severity: 'success'
        });
      } else {
        setError(data.error || 'Failed to analyze idea');
        setSnackbar({
          open: true,
          message: data.error || 'Failed to analyze idea',
          severity: 'error'
        });
      }
    } catch (error) {
      setError('Network error. Please try again.');
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const startWorkflow = async (idea) => {
    setWorkflowLoading(true);
    setShowWorkflow(true);
    setActiveStep(0);
    
    // Simulate step progression
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
        body: JSON.stringify({ idea })
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

  const handleNewAnalysis = () => {
    localStorage.removeItem('startupAnalysis');
    localStorage.removeItem('lastIdea');
    setWorkflowData(null);
    setShowWorkflow(false);
    window.location.href = '/';
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleWorkflow = () => {
    setShowWorkflow(!showWorkflow);
  };

  // Loading State
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#00E676', mb: 3 }} />
          <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 2 }}>
            Analyzing Your Startup Idea
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Our AI is generating comprehensive insights...
          </Typography>
        </Container>
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <MainCard sx={{ bgcolor: '#121212', border: '1px solid #FF5252' }}>
            <Stack sx={{ gap: 3, textAlign: 'center', py: 2 }}>
              <WarningOutlined style={{ fontSize: '4rem', color: '#FF5252' }} />
              <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
                Analysis Failed
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {error}
              </Typography>
              <Button variant="contained" onClick={handleNewAnalysis} sx={{ bgcolor: '#00E676', color: '#000000', '&:hover': { bgcolor: '#00C853' } }}>
                Try Another Idea
              </Button>
            </Stack>
          </MainCard>
        </Container>
      </Box>
    );
  }

  // No Analysis State
  if (!analysis) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <MainCard sx={{ bgcolor: '#121212', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Stack sx={{ gap: 3, textAlign: 'center', py: 2 }}>
              <BulbOutlined style={{ fontSize: '4rem', color: '#00E676' }} />
              <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
                No Analysis Found
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Please enter a startup idea on the homepage to get started.
              </Typography>
              <Button variant="contained" onClick={handleNewAnalysis} sx={{ bgcolor: '#00E676', color: '#000000', '&:hover': { bgcolor: '#00C853' } }}>
                Go to Homepage
              </Button>
            </Stack>
          </MainCard>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0A0A0A', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          {/* Header */}
          <Grid sx={{ mb: -2.25 }} size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
                Startup Analysis Results
              </Typography>

            </Stack>
          </Grid>

          {/* Workflow Section */}
          {showWorkflow && (
            <Grid size={12}>
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
                        </Grid>
                      </MainCard>
                    )}

                    {/* Similar Startups */}
                    {workflowData.similarStartups && workflowData.similarStartups.length > 0 && (
                      <MainCard sx={{ bgcolor: '#121212', mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#2196F3', mb: 2 }}>
                          <DatabaseOutlined sx={{ mr: 1 }} />
                          Similar Startups from Pinecone
                        </Typography>
                        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                        
                        <Grid container spacing={2}>
                          {workflowData.similarStartups.map((startup, idx) => (
                            <Grid item xs={12} md={6} key={idx}>
                              <Paper sx={{ 
                                p: 2, 
                                bgcolor: 'rgba(33,150,243,0.05)',
                                borderLeft: '3px solid #2196F3'
                              }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography variant="subtitle1" sx={{ color: '#FFFFFF' }}>
                                    {startup.name}
                                  </Typography>
                                  <Chip 
                                    label={`${(startup.similarity * 100).toFixed(0)}% match`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(33,150,243,0.1)', color: '#2196F3' }}
                                  />
                                </Stack>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                                  {startup.description}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </MainCard>
                    )}
                  </Box>
                ) : null}
              </Paper>
            </Grid>
          )}

          {/* Row 1 - KPI Cards */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnalyticEcommerce 
              title="Feasibility Score" 
              count={analysis.feasibilityScore?.toString() || '0'} 
              percentage={analysis.feasibilityScore * 10} 
              extra={`${analysis.feasibilityScore}/10`}
              color={analysis.feasibilityScore >= 7 ? 'success' : analysis.feasibilityScore >= 4 ? 'warning' : 'error'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnalyticEcommerce 
              title="Risk Level" 
              count={(10 - (analysis.feasibilityScore || 7)).toString()} 
              percentage={(10 - (analysis.feasibilityScore || 7)) * 10} 
              extra="/10"
              color={analysis.feasibilityScore >= 7 ? 'success' : analysis.feasibilityScore >= 4 ? 'warning' : 'error'}
              isLoss={analysis.feasibilityScore < 4}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnalyticEcommerce 
              title="Competitors" 
              count={analysis.competitors?.length?.toString() || '0'} 
              percentage={Math.min(100, (analysis.competitors?.length || 0) * 10)} 
              extra="identified"
              color={analysis.competitors?.length <= 3 ? 'success' : analysis.competitors?.length <= 6 ? 'warning' : 'error'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnalyticEcommerce 
              title="Business Models" 
              count={analysis.businessModels?.length?.toString() || '0'} 
              percentage={Math.min(100, ((analysis.businessModels?.length || 0) / 5) * 100)} 
              extra="revenue streams"
              color="success"
            />
          </Grid>

          {/* Row 2 - Overview */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <MainCard sx={{ bgcolor: '#121212' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF' }}>Overview</Typography>
                <Chip 
                  label={analysis.industryCategory}
                  sx={{ 
                    bgcolor: 'rgba(0,230,118,0.1)', 
                    color: '#00E676',
                    border: '1px solid rgba(0,230,118,0.2)'
                  }} 
                />
              </Stack>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                {analysis.overview}
              </Typography>
              {analysis.valueProposition && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,230,118,0.05)', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <BulbOutlined style={{ color: '#00E676' }} />
                    <Typography variant="subtitle2" sx={{ color: '#00E676' }}>Value Proposition</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {analysis.valueProposition}
                  </Typography>
                </Box>
              )}
            </MainCard>
          </Grid>

          {/* Row 2 - Quick Stats */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <MainCard sx={{ bgcolor: '#121212' }}>
              <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 3 }}>Quick Stats</Typography>
              <List sx={{ p: 0 }}>
                <ListItemButton divider sx={{ py: 2 }}>
                  <ListItemText primary="Target Segments" sx={{ '& .MuiTypography-root': { color: 'rgba(255,255,255,0.7)' } }} />
                  <Typography variant="h6" sx={{ color: '#00E676' }}>{analysis.targetCustomers?.length || 0}</Typography>
                </ListItemButton>
                <ListItemButton divider sx={{ py: 2 }}>
                  <ListItemText primary="Risk Factors" sx={{ '& .MuiTypography-root': { color: 'rgba(255,255,255,0.7)' } }} />
                  <Typography variant="h6" sx={{ color: '#FF5252' }}>{analysis.risks?.length || 0}</Typography>
                </ListItemButton>
                <ListItemButton sx={{ py: 2 }}>
                  <ListItemText primary="Market Readiness" sx={{ '& .MuiTypography-root': { color: 'rgba(255,255,255,0.7)' } }} />
                  <Typography variant="h6" sx={{ color: '#FFD700' }}>
                    {analysis.feasibilityScore >= 7 ? 'High' : analysis.feasibilityScore >= 4 ? 'Medium' : 'Low'}
                  </Typography>
                </ListItemButton>
              </List>
            </MainCard>
          </Grid>

          {/* Row 3 - Target Customers & Business Models */}
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard sx={{ bgcolor: '#121212' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF' }}>Target Customers</Typography>
                <IconButton sx={{ color: '#FFFFFF' }}>
                  <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
                </IconButton>
              </Stack>
              <List sx={{ p: 0 }}>
                {analysis.targetCustomers?.map((customer, index) => (
                  <ListItem key={index} divider={index < analysis.targetCustomers.length - 1} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ color: '#00E676', bgcolor: 'rgba(0,230,118,0.1)' }}>
                        <UserOutlined />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography sx={{ color: '#FFFFFF' }}>{customer}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard sx={{ bgcolor: '#121212' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF' }}>Business Models</Typography>
                <IconButton sx={{ color: '#FFFFFF' }}>
                  <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
                </IconButton>
              </Stack>
              <List sx={{ p: 0 }}>
                {analysis.businessModels?.map((model, index) => (
                  <ListItem key={index} divider={index < analysis.businessModels.length - 1} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ color: '#00E676', bgcolor: 'rgba(0,230,118,0.1)' }}>
                        <ShopOutlined />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography sx={{ color: '#FFFFFF' }}>{model}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </MainCard>
          </Grid>

          {/* Row 4 - Market Size */}
          <Grid size={{ xs: 12, md: 4 }}>
            <MainCard sx={{ bgcolor: '#121212' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF' }}>Market Size (₹)</Typography>
                <IconButton sx={{ color: '#FFFFFF' }}>
                  <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
                </IconButton>
              </Stack>
              <List sx={{ p: 0 }}>
                <ListItem divider>
                  <ListItemAvatar>
                    <Avatar sx={{ color: '#2196F3', bgcolor: 'rgba(33,150,243,0.1)' }}>
                      <GlobalOutlined />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#FFFFFF' }}>TAM</Typography>}
                    secondary={<Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>{analysis.marketSize?.tam || 'N/A'}</Typography>}
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemAvatar>
                    <Avatar sx={{ color: '#FF9800', bgcolor: 'rgba(255,152,0,0.1)' }}>
                      <AimOutlined />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#FFFFFF' }}>SAM</Typography>}
                    secondary={<Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>{analysis.marketSize?.sam || 'N/A'}</Typography>}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ color: '#00E676', bgcolor: 'rgba(0,230,118,0.1)' }}>
                      <PieChartOutlined />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#FFFFFF' }}>SOM</Typography>}
                    secondary={<Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>{analysis.marketSize?.som || 'N/A'}</Typography>}
                  />
                </ListItem>
              </List>
            </MainCard>
          </Grid>

          {/* Pricing Strategy */}
          <Grid item xs={12} md={3}>
            <MainCard sx={{ bgcolor: '#121212' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF' }}>Pricing Strategy</Typography>
                <IconButton sx={{ color: '#FFFFFF' }}>
                  <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
                </IconButton>
              </Stack>
              <Box sx={{ p: 2, bgcolor: 'rgba(255,215,0,0.05)', borderRadius: 1, mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <TagOutlined style={{ color: '#FFD700' }} />
                  <Typography variant="subtitle2" sx={{ color: '#FFD700' }}>Price Range</Typography>
                </Stack>
                <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                  {analysis.pricingStrategy?.priceRange || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ p: 2, bgcolor: 'rgba(33,150,243,0.05)', borderRadius: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <TagOutlined style={{ color: '#2196F3' }} />
                  <Typography variant="subtitle2" sx={{ color: '#2196F3' }}>Pricing Model</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {analysis.pricingStrategy?.model || 'N/A'}
                </Typography>
              </Box>
            </MainCard>
          </Grid>

          {/* Risks */}
          <Grid size={{ xs: 12, md: 13 }}>
            <MainCard sx={{ bgcolor: '#121212' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF' }}>Risks & Challenges</Typography>
                <IconButton sx={{ color: '#FFFFFF' }}>
                  <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
                </IconButton>
              </Stack>
              <List sx={{ p: 0 }}>
                {analysis.risks?.map((risk, index) => (
                  <ListItem key={index} divider={index < analysis.risks.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ color: '#FF5252', bgcolor: 'rgba(255,82,82,0.1)' }}>
                        <WarningOutlined />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography sx={{ color: '#FFFFFF' }}>{risk}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </MainCard>
          </Grid>

          {/* Competitors */}
          <Grid size={{ xs: 12, md: 13 }}>
            <MainCard sx={{ bgcolor: '#121212' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF' }}>Key Competitors</Typography>
                <IconButton sx={{ color: '#FFFFFF' }}>
                  <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
                </IconButton>
              </Stack>
              <List sx={{ p: 0 }}>
                {analysis.competitors?.map((competitor, index) => {
                  const threatColor = competitor.threat?.toLowerCase().includes('high') ? '#FF5252' :
                                     competitor.threat?.toLowerCase().includes('medium') ? '#FF9800' : '#00E676';
                  return (
                    <ListItem key={index} divider={index < analysis.competitors.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ color: threatColor, bgcolor: `${threatColor}20` }}>
                          <TeamOutlined />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography sx={{ color: '#FFFFFF' }}>{competitor.name}</Typography>}
                        secondary={<Typography sx={{ color: threatColor }}>{competitor.threat}</Typography>}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </MainCard>
          </Grid>

          {/* AI Confidence */}
          <Grid size={12}>
            <MainCard sx={{ bgcolor: '#121212', border: '1px solid #00E676' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#00E676', width: 48, height: 48 }}>
                    <BulbOutlined style={{ fontSize: '1.5rem', color: '#000000' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#FFFFFF' }}>AI Confidence Score</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Based on comprehensive market analysis
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h3" sx={{ color: '#00E676' }}>
                    {analysis.feasibilityScore}/10
                  </Typography>
                  <Chip 
                    label={analysis.feasibilityScore >= 7 ? 'High Potential' : 
                           analysis.feasibilityScore >= 4 ? 'Moderate' : 'Challenging'}
                    sx={{
                      bgcolor: analysis.feasibilityScore >= 7 ? 'rgba(0,230,118,0.1)' : 
                               analysis.feasibilityScore >= 4 ? 'rgba(255,152,0,0.1)' : 'rgba(255,82,82,0.1)',
                      color: analysis.feasibilityScore >= 7 ? '#00E676' : 
                             analysis.feasibilityScore >= 4 ? '#FF9800' : '#FF5252',
                    }}
                  />
                </Stack>
              </Stack>
            </MainCard>
          </Grid>
        </Grid>

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