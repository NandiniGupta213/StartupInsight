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
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Fade from '@mui/material/Fade';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';

// project imports
import MainCard from 'components/MainCard';

// assets
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import SwapOutlined from '@ant-design/icons/SwapOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import TrophyOutlined from '@ant-design/icons/TrophyOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import AimOutlined from '@ant-design/icons/AimOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import ExperimentOutlined from '@ant-design/icons/ExperimentOutlined';
import HourglassOutlined from '@ant-design/icons/HourglassOutlined';
import FundOutlined from '@ant-design/icons/FundOutlined';
import ThunderboltOutlined from '@ant-design/icons/ThunderboltOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import BulbOutlined from '@ant-design/icons/BulbOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

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

export default function CompareEnginePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery } = useSearch();
  
  // State
  const [selectedIdeaA, setSelectedIdeaA] = useState(null);
  const [selectedIdeaB, setSelectedIdeaB] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [relatedStartups, setRelatedStartups] = useState([]);
  const [loadingStartups, setLoadingStartups] = useState(false);
  const [searchQueryState, setSearchQueryState] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [searchAnalysis, setSearchAnalysis] = useState(null);
  const [stats, setStats] = useState({ databaseResults: 0, generatedResults: 0, indianCompanies: 0, globalCompanies: 0 });

  // Workflow state
  const [workflowData, setWorkflowData] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showWorkflow, setShowWorkflow] = useState(false);

  // Auto-fetch related startups when searchQuery changes from context
  useEffect(() => {
    if (searchQuery) {
      console.log('🔍 Got search query from context:', searchQuery);
      setSearchQueryState(searchQuery);
      fetchRelatedStartups(searchQuery);
      startWorkflow(searchQuery); // Start workflow in background
      localStorage.setItem('lastSearchQuery', searchQuery);
    } else {
      const savedQuery = localStorage.getItem('lastSearchQuery');
      if (savedQuery && !searchQueryState) {
        setSearchQueryState(savedQuery);
        fetchRelatedStartups(savedQuery);
        startWorkflow(savedQuery);
      } else {
        setLoadingStartups(false);
      }
    }
  }, [searchQuery]);

  // Simulate loading progress
  useEffect(() => {
    let interval;
    if (loadingStartups) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
    } else {
      setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [loadingStartups]);

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

  const fetchRelatedStartups = async (query) => {
    if (!query) return;
    
    setLoadingStartups(true);
    try {
      console.log('📡 Fetching related startups for:', query);
      
      const response = await fetch(`${API_BASE_URL}/startup/related`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      console.log('📦 API Response:', data);
      
      if (data.success) {
        setRelatedStartups(data.startups || []);
        setSearchAnalysis(data.analysis || null);
        setStats(data.stats || { databaseResults: 0, generatedResults: 0, indianCompanies: 0, globalCompanies: 0 });
        
        if (data.startups && data.startups.length >= 2) {
          setSelectedIdeaA(data.startups[0]);
          setSelectedIdeaB(data.startups[1]);
          console.log('✅ Auto-selected:', data.startups[0].name, 'vs', data.startups[1].name);
        } else if (data.startups && data.startups.length === 1) {
          setSelectedIdeaA(data.startups[0]);
          console.log('✅ Auto-selected first idea:', data.startups[0].name);
        }
        
        setSnackbar({
          open: true,
          message: `Found ${data.startups?.length || 0} related startups`,
          severity: 'success'
        });
      } else {
        console.error('❌ API returned error:', data.error);
        setSnackbar({
          open: true,
          message: data.error || 'Failed to load related startups',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch related startups:', error);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoadingStartups(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedIdeaA || !selectedIdeaB) {
      setSnackbar({
        open: true,
        message: 'Please select two ideas to compare',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Comparing:', selectedIdeaA.name, 'vs', selectedIdeaB.name);
      
      const response = await fetch(`${API_BASE_URL}/open/compare`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ideaA: selectedIdeaA.name,
          ideaB: selectedIdeaB.name
        })
      });

      const data = await response.json();
      console.log('📊 Comparison result:', data);
      
      if (data.success) {
        setComparisonResult(data.comparison);
        
        localStorage.setItem('lastComparison', JSON.stringify({
          result: data.comparison,
          ideaA: selectedIdeaA,
          ideaB: selectedIdeaB,
          timestamp: new Date().toISOString()
        }));
        
        setSnackbar({
          open: true,
          message: data.cached ? '✨ Loaded from cache!' : '✅ Comparison complete!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: data.error || 'Failed to compare ideas',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('❌ Comparison error:', error);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedComparison = localStorage.getItem('lastComparison');
    if (savedComparison) {
      try {
        const parsed = JSON.parse(savedComparison);
        const age = new Date() - new Date(parsed.timestamp);
        if (age < 24 * 60 * 60 * 1000) {
          setComparisonResult(parsed.result);
          setSelectedIdeaA(parsed.ideaA);
          setSelectedIdeaB(parsed.ideaB);
          console.log('📦 Restored previous comparison from localStorage');
        }
      } catch (e) {
        console.error('Failed to parse saved comparison', e);
      }
    }
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleWorkflow = () => {
    setShowWorkflow(!showWorkflow);
  };

  const renderOption = (props, option) => {
    const { key, ...restProps } = props;
    return (
      <li key={key} {...restProps}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 0.5 }}>
          <Avatar sx={{ bgcolor: '#00E676', width: 32, height: 32 }}>
            {option.name?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{option.name}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ color: '#666' }}>
                {option.category || 'General'}
              </Typography>
              <Chip 
                label={option.region || 'Global'}
                size="small"
                sx={{ 
                  height: 16,
                  fontSize: '0.6rem',
                  bgcolor: option.region === 'India' ? 'rgba(0,230,118,0.1)' : 'rgba(33,150,243,0.1)',
                  color: option.region === 'India' ? '#00E676' : '#2196F3'
                }}
              />
              {option.source === 'ai-generated' && (
                <Chip 
                  label="AI"
                  size="small"
                  sx={{ 
                    height: 16,
                    fontSize: '0.6rem',
                    bgcolor: 'rgba(255,215,0,0.1)',
                    color: '#FFD700'
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </li>
    );
  };

  return (
    <Box sx={{ bgcolor: '#0A0A0A', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          
          <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
            Compare Ideas
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
        )}

        {/* Search Analysis Banner */}
        {searchAnalysis && !loadingStartups && (
          <Fade in={!!searchAnalysis}>
            <Paper sx={{ p: 3, bgcolor: '#121212', border: '1px solid #00E676', mb: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(0,230,118,0.1)', color: '#00E676' }}>
                      <SearchOutlined />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Industry Detected
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#00E676', fontWeight: 600 }}>
                        {searchAnalysis.mainIndustry}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>
                      <AimOutlined />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Sub-Category
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 600 }}>
                        {searchAnalysis.subCategory}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        )}

        {/* Stats Banner */}
        {stats.databaseResults > 0 && !loadingStartups && (
          <Fade in={stats.databaseResults > 0}>
            <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #2A2A2A', mb: 4 }}>
              <Grid container spacing={2} justifyContent="space-around">
                <Grid item>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(0,230,118,0.1)', width: 28, height: 28 }}>
                      <FundOutlined style={{ color: '#00E676', fontSize: '1rem' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        In Database
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#00E676', fontWeight: 600 }}>
                        {stats.databaseResults}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,215,0,0.1)', width: 28, height: 28 }}>
                      <BulbOutlined style={{ color: '#FFD700', fontSize: '1rem' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        AI Generated
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 600 }}>
                        {stats.generatedResults}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(0,230,118,0.1)', width: 28, height: 28 }}>
                      <AimOutlined style={{ color: '#00E676', fontSize: '1rem' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Indian Companies
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#00E676', fontWeight: 600 }}>
                        {stats.indianCompanies}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(33,150,243,0.1)', width: 28, height: 28 }}>
                      <GlobalOutlined style={{ color: '#2196F3', fontSize: '1rem' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Global Companies
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2196F3', fontWeight: 600 }}>
                        {stats.globalCompanies}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        )}

        {/* Enhanced Loading State */}
        {loadingStartups && (
          <Fade in={loadingStartups}>
            <Paper sx={{ p: 6, bgcolor: '#121212', textAlign: 'center', mb: 4 }}>
              <HourglassOutlined style={{ fontSize: '3rem', color: '#00E676', marginBottom: 16 }} />
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                Finding startups related to "{searchQueryState}"...
              </Typography>
              <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={loadingProgress}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#00E676' },
                    height: 6,
                    borderRadius: 3
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Analyzing industry, searching database, and finding relevant startups...
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Selection Area */}
        {!loadingStartups && relatedStartups.length > 0 && (
          <Fade in={!loadingStartups}>
            <Paper sx={{ p: 3, bgcolor: "#121212", border: "1px solid #2A2A2A", mb: 4, width: "100%" }}>
              <Grid container spacing={2} alignItems="center">
                {/* First Dropdown */}
                <Grid item xs={12} md={5.5}>
                  <Autocomplete
                    fullWidth
                    options={relatedStartups.filter(s => s.id !== selectedIdeaB?.id)}
                    getOptionLabel={(option) => option.name || ""}
                    value={selectedIdeaA}
                    onChange={(e, val) => setSelectedIdeaA(val)}
                    renderOption={renderOption}
                    PopperProps={{ style: { width: 'fit-content', minWidth: '400px' }, placement: 'bottom-start' }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select first startup..."
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "#FFFFFF",
                            bgcolor: "rgba(255,255,255,0.05)",
                            "& fieldset": { borderColor: "#2A2A2A" },
                            "&:hover fieldset": { borderColor: "#00E676" },
                            "&.Mui-focused fieldset": { borderColor: "#00E676" }
                          }
                        }}
                      />
                    )}
                    ListboxProps={{
                      sx: {
                        maxHeight: 320,
                        bgcolor: '#1E1E1E',
                        '& li': {
                          py: 1.5,
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          '&:hover': { bgcolor: 'rgba(0,230,118,0.1)' }
                        }
                      }
                    }}
                  />
                </Grid>

                {/* VS */}
                <Grid item xs={12} md={1} sx={{ textAlign: "center" }}>
                  <Typography sx={{ color: "#00E676", fontWeight: 600, fontSize: "1rem" }}>
                    VS
                  </Typography>
                </Grid>

                {/* Second Dropdown */}
                <Grid item xs={12} md={5.5}>
                  <Autocomplete
                    fullWidth
                    options={relatedStartups.filter(s => s.id !== selectedIdeaA?.id)}
                    getOptionLabel={(option) => option.name || ""}
                    value={selectedIdeaB}
                    onChange={(e, val) => setSelectedIdeaB(val)}
                    renderOption={renderOption}
                    PopperProps={{ style: { width: 'fit-content', minWidth: '400px' }, placement: 'bottom-start' }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select second startup..."
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            color: "#FFFFFF",
                            bgcolor: "rgba(255,255,255,0.05)",
                            "& fieldset": { borderColor: "#2A2A2A" },
                            "&:hover fieldset": { borderColor: "#00E676" },
                            "&.Mui-focused fieldset": { borderColor: "#00E676" }
                          }
                        }}
                      />
                    )}
                    ListboxProps={{
                      sx: {
                        maxHeight: 320,
                        bgcolor: '#1E1E1E',
                        '& li': {
                          py: 1.5,
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          '&:hover': { bgcolor: 'rgba(0,230,118,0.1)' }
                        }
                      }
                    }}
                  />
                </Grid>

                {/* Compare Button */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleCompare}
                    disabled={!selectedIdeaA || !selectedIdeaB || loading}
                    startIcon={loading ? <CircularProgress size={18} /> : <SwapOutlined />}
                    sx={{
                      bgcolor: "#00E676",
                      color: "#000000",
                      px: 5,
                      py: 1,
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      minWidth: 160,
                      "&:hover": { bgcolor: "#00C853" },
                      "&.Mui-disabled": { bgcolor: "rgba(0,230,118,0.3)" }
                    }}
                  >
                    {loading ? "Comparing..." : "Compare"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        )}

        {/* No Results */}
        {!loadingStartups && relatedStartups.length === 0 && !comparisonResult && (
          <Fade in={true}>
            <Paper sx={{ p: 6, bgcolor: '#121212', textAlign: 'center' }}>
              <SearchOutlined style={{ fontSize: '3rem', color: '#00E676', marginBottom: 16 }} />
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
                No related startups found
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {searchQueryState ? `No results for "${searchQueryState}"` : 'Try searching for a startup idea on the homepage'}
              </Typography>
              <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 3, borderColor: '#00E676', color: '#00E676' }}>
                Back to Homepage
              </Button>
            </Paper>
          </Fade>
        )}

        {/* Comparison Results */}
        {comparisonResult && (
          <Fade in={true}>
            <Box sx={{ mt: 4 }}>
              {/* Winner Card */}
              <MainCard sx={{ bgcolor: '#121212', border: '2px solid #00E676', mb: 4, p: 4 }}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar sx={{ bgcolor: '#00E676', width: 90, height: 90 }}>
                    <TrophyOutlined style={{ fontSize: '3rem', color: '#000000' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ color: '#00E676', mb: 1, fontWeight: 700 }}>
                      Winner: {comparisonResult.winner === 'Idea A' ? selectedIdeaA?.name : selectedIdeaB?.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                      {comparisonResult.winnerReason}
                    </Typography>
                  </Box>
                </Stack>
              </MainCard>

              {/* Target Customers Section */}
              <MainCard sx={{ bgcolor: '#121212', mb: 4 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 2 }}>🎯 Target Customers</Typography>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ color: '#00E676', mb: 2, fontWeight: 600 }}>
                      {selectedIdeaA?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {comparisonResult.targetCustomers?.ideaA?.map((customer, idx) => (
                        <Chip key={idx} label={customer} sx={{ bgcolor: 'rgba(0,230,118,0.1)', color: '#00E676', border: '1px solid rgba(0,230,118,0.3)', fontSize: '0.9rem', py: 2 }} />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ color: '#2196F3', mb: 2, fontWeight: 600 }}>
                      {selectedIdeaB?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {comparisonResult.targetCustomers?.ideaB?.map((customer, idx) => (
                        <Chip key={idx} label={customer} sx={{ bgcolor: 'rgba(33,150,243,0.1)', color: '#2196F3', border: '1px solid rgba(33,150,243,0.3)', fontSize: '0.9rem', py: 2 }} />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: '#00E676', fontStyle: 'italic', mt: 2 }}>
                      {comparisonResult.targetCustomers?.insight}
                    </Typography>
                  </Grid>
                </Grid>
              </MainCard>

              {/* Business Models & Market Opportunity */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <MainCard sx={{ bgcolor: '#121212', height: '100%' }}>
                    <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 2 }}>💼 Business Models</Typography>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{ color: '#00E676', mb: 2, textAlign: 'center' }}>
                          {selectedIdeaA?.name}
                        </Typography>
                        {comparisonResult.businessModels?.ideaA?.map((model, idx) => (
                          <Paper key={idx} sx={{ p: 1.5, bgcolor: 'rgba(0,230,118,0.05)', mb: 1, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{model}</Typography>
                          </Paper>
                        ))}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{ color: '#2196F3', mb: 2, textAlign: 'center' }}>
                          {selectedIdeaB?.name}
                        </Typography>
                        {comparisonResult.businessModels?.ideaB?.map((model, idx) => (
                          <Paper key={idx} sx={{ p: 1.5, bgcolor: 'rgba(33,150,243,0.05)', mb: 1, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{model}</Typography>
                          </Paper>
                        ))}
                      </Grid>
                    </Grid>
                    <Typography variant="body2" sx={{ color: '#00E676', mt: 2, fontStyle: 'italic' }}>
                      {comparisonResult.businessModels?.insight}
                    </Typography>
                  </MainCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <MainCard sx={{ bgcolor: '#121212', height: '100%' }}>
                    <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 2 }}>📊 Market Opportunity</Typography>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: '#FFFFFF' }}>Market</TableCell>
                            <TableCell align="center" sx={{ color: '#00E676' }}>{selectedIdeaA?.name}</TableCell>
                            <TableCell align="center" sx={{ color: '#2196F3' }}>{selectedIdeaB?.name}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>TAM</TableCell>
                            <TableCell align="center" sx={{ color: '#FFFFFF' }}>{comparisonResult.marketOpportunity?.ideaA?.tam}</TableCell>
                            <TableCell align="center" sx={{ color: '#FFFFFF' }}>{comparisonResult.marketOpportunity?.ideaB?.tam}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>SAM</TableCell>
                            <TableCell align="center" sx={{ color: '#FFFFFF' }}>{comparisonResult.marketOpportunity?.ideaA?.sam}</TableCell>
                            <TableCell align="center" sx={{ color: '#FFFFFF' }}>{comparisonResult.marketOpportunity?.ideaB?.sam}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>SOM</TableCell>
                            <TableCell align="center" sx={{ color: '#FFFFFF' }}>{comparisonResult.marketOpportunity?.ideaA?.som}</TableCell>
                            <TableCell align="center" sx={{ color: '#FFFFFF' }}>{comparisonResult.marketOpportunity?.ideaB?.som}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Typography variant="body2" sx={{ color: '#00E676', mt: 2, fontStyle: 'italic' }}>
                      {comparisonResult.marketOpportunity?.insight}
                    </Typography>
                  </MainCard>
                </Grid>
              </Grid>

              {/* Competitor Threat & Feasibility Scores */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <MainCard sx={{ bgcolor: '#121212', height: '100%' }}>
                    <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 2 }}>🏆 Competitor Threat Levels</Typography>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{ color: '#00E676', mb: 2, textAlign: 'center' }}>
                          {selectedIdeaA?.name}
                        </Typography>
                        {comparisonResult.competitors?.ideaA?.map((comp, idx) => {
                          const threatColor = comp.threat?.toLowerCase().includes('high') ? '#FF5252' :
                                             comp.threat?.toLowerCase().includes('medium') ? '#FF9800' : '#00E676';
                          return (
                            <Paper key={idx} sx={{ p: 1.5, bgcolor: `${threatColor}10`, mb: 1, borderLeft: `3px solid ${threatColor}` }}>
                              <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{comp.name}</Typography>
                              <Typography variant="caption" sx={{ color: threatColor }}>{comp.threat}</Typography>
                            </Paper>
                          );
                        })}
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{ color: '#2196F3', mb: 2, textAlign: 'center' }}>
                          {selectedIdeaB?.name}
                        </Typography>
                        {comparisonResult.competitors?.ideaB?.map((comp, idx) => {
                          const threatColor = comp.threat?.toLowerCase().includes('high') ? '#FF5252' :
                                             comp.threat?.toLowerCase().includes('medium') ? '#FF9800' : '#00E676';
                          return (
                            <Paper key={idx} sx={{ p: 1.5, bgcolor: `${threatColor}10`, mb: 1, borderLeft: `3px solid ${threatColor}` }}>
                              <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{comp.name}</Typography>
                              <Typography variant="caption" sx={{ color: threatColor }}>{comp.threat}</Typography>
                            </Paper>
                          );
                        })}
                      </Grid>
                    </Grid>
                    <Typography variant="body2" sx={{ color: '#00E676', mt: 2, fontStyle: 'italic' }}>
                      {comparisonResult.competitors?.insight}
                    </Typography>
                  </MainCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <MainCard sx={{ bgcolor: '#121212', height: '100%' }}>
                    <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 2 }}>📈 Feasibility Scores</Typography>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                    
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#00E676' }}>{selectedIdeaA?.name}</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{comparisonResult.feasibilityScores?.ideaA}/10</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={comparisonResult.feasibilityScores?.ideaA * 10} sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00E676' } }} />
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#2196F3' }}>{selectedIdeaB?.name}</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{comparisonResult.feasibilityScores?.ideaB}/10</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={comparisonResult.feasibilityScores?.ideaB * 10} sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#2196F3' } }} />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#00E676', mt: 2, fontStyle: 'italic' }}>
                      {comparisonResult.feasibilityScores?.insight}
                    </Typography>
                  </MainCard>
                </Grid>
              </Grid>

              {/* Risk Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <MainCard sx={{ bgcolor: '#121212' }}>
                    <Typography variant="h5" sx={{ color: '#FF5252', mb: 2 }}>⚠️ {selectedIdeaA?.name} - Risks</Typography>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    <List>
                      {comparisonResult.risks?.ideaA?.map((risk, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WarningOutlined style={{ color: '#FF5252' }} />
                          </ListItemIcon>
                          <ListItemText primary={<Typography sx={{ color: '#FFFFFF' }}>{risk}</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  </MainCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MainCard sx={{ bgcolor: '#121212' }}>
                    <Typography variant="h5" sx={{ color: '#FF5252', mb: 2 }}>⚠️ {selectedIdeaB?.name} - Risks</Typography>
                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    <List>
                      {comparisonResult.risks?.ideaB?.map((risk, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WarningOutlined style={{ color: '#FF5252' }} />
                          </ListItemIcon>
                          <ListItemText primary={<Typography sx={{ color: '#FFFFFF' }}>{risk}</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  </MainCard>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#00E676', fontStyle: 'italic' }}>
                    {comparisonResult.risks?.insight}
                  </Typography>
                </Grid>
              </Grid>

              {/* AI Summary */}
              <MainCard sx={{ bgcolor: '#121212', border: '1px solid #00E676' }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#00E676' }}>
                    <TrophyOutlined />
                  </Avatar>
                  <Typography variant="h5" sx={{ color: '#00E676' }}>
                    AI Summary
                  </Typography>
                </Stack>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
                  {comparisonResult.summary}
                </Typography>
              </MainCard>
            </Box>
          </Fade>
        )}

        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ bgcolor: snackbar.severity === 'success' ? '#1B5E1F' : snackbar.severity === 'error' ? '#B71C1C' : '#FF6F00', color: '#FFFFFF' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}