import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// project imports
import MainCard from 'components/MainCard';

// assets
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import FundOutlined from '@ant-design/icons/FundOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import StockOutlined from '@ant-design/icons/StockOutlined';
import BulbOutlined from '@ant-design/icons/BulbOutlined';
import ExperimentOutlined from '@ant-design/icons/ExperimentOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import ShareAltOutlined from '@ant-design/icons/ShareAltOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import LineChartOutlined from '@ant-design/icons/LineChartOutlined';

// ==============================|| INVESTMENT SIMULATOR PAGE ||============================== //

export default function InvestmentSimulatorPage() {
  const { startupId } = useParams();
  const navigate = useNavigate();
  
  // User inputs
  const [investmentAmount, setInvestmentAmount] = useState(500000);
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [riskAppetite, setRiskAppetite] = useState('moderate');
  const [simulationRun, setSimulationRun] = useState(false);
  
  // Simulation results
  const [roi, setRoi] = useState(0);
  const [irr, setIrr] = useState(0);
  const [breakEvenYear, setBreakEvenYear] = useState(0);
  const [survivalProbability, setSurvivalProbability] = useState(0);
  const [riskAdjustedReturn, setRiskAdjustedReturn] = useState(0);
  const [projectedValue, setProjectedValue] = useState(0);
  const [moic, setMoic] = useState(0);
  
  // Chart data
  const [roiProjection, setRoiProjection] = useState([]);
  const [scenarios, setScenarios] = useState([]);

  // Startup data
  const startupData = {
    'neuralcore-ai': {
      name: 'NeuralCore AI',
      category: 'AI/ML',
      stage: 'Series B',
      valuation: '$180M',
      revenue: '$12.4M',
      growth: 156,
      burnRate: '$450K',
      runway: 18,
      riskScore: 34,
      sector: 'Enterprise AI',
      founded: 2021,
      logo: 'N',
      color: '#00E676'
    },
    'greencharge': {
      name: 'GreenCharge',
      category: 'CleanTech',
      stage: 'Series A',
      valuation: '$95M',
      revenue: '$8.2M',
      growth: 112,
      burnRate: '$380K',
      runway: 22,
      riskScore: 42,
      sector: 'Clean Energy',
      founded: 2020,
      logo: 'G',
      color: '#2196F3'
    },
    'mediflow': {
      name: 'MediFlow',
      category: 'HealthTech',
      stage: 'Series B',
      valuation: '$145M',
      revenue: '$10.8M',
      growth: 134,
      burnRate: '$420K',
      runway: 20,
      riskScore: 38,
      sector: 'Digital Health',
      founded: 2019,
      logo: 'M',
      color: '#FF9800'
    }
  };

  const startup = startupData[startupId] || startupData['neuralcore-ai'];

  // Risk multipliers based on appetite
  const riskMultipliers = {
    conservative: { success: 1.2, return: 0.7, volatility: 0.5 },
    moderate: { success: 1.0, return: 1.0, volatility: 1.0 },
    aggressive: { success: 0.8, return: 1.5, volatility: 1.8 }
  };

  const runSimulation = () => {
    setSimulationRun(true);
    
    // Get risk multiplier
    const multiplier = riskMultipliers[riskAppetite];
    
    // Base calculations from startup fundamentals
    const baseGrowth = startup.growth / 100; // 1.56 for NeuralCore
    const baseRisk = startup.riskScore / 100; // 0.34 for NeuralCore
    
    // Adjust for time horizon - growth typically slows over time
    const growthDecay = 0.85; // 15% decay per year
    const riskDecay = 0.95; // Risk decreases slightly over time as startup matures
    
    // Calculate projected values for each year
    const projection = [];
    let cumulativeValue = investmentAmount;
    let breakEvenAchieved = false;
    let breakEvenYear_temp = 0;
    
    for (let year = 1; year <= timeHorizon; year++) {
      // Year-specific growth rate (declining)
      const yearGrowth = baseGrowth * Math.pow(growthDecay, year - 1) * multiplier.return;
      
      // Year-specific risk (decreasing)
      const yearRisk = baseRisk * Math.pow(riskDecay, year - 1) / multiplier.success;
      
      // Monte Carlo style projection with some randomness
      const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
      const yearReturn = investmentAmount * yearGrowth * year * randomFactor;
      
      cumulativeValue += yearReturn;
      
      // Check if we've broken even
      if (!breakEvenAchieved && cumulativeValue > investmentAmount * 1.1) { // 10% above initial to account for fees
        breakEvenAchieved = true;
        breakEvenYear_temp = year;
      }
      
      projection.push({
        year: `Year ${year}`,
        value: Math.round(cumulativeValue / 1000000 * 10) / 10, // in millions
        investment: investmentAmount,
        growth: Math.round(yearReturn / 1000000 * 10) / 10
      });
    }
    
    setRoiProjection(projection);
    
    // Calculate final metrics
    const finalValue = cumulativeValue;
    const totalReturn = finalValue - investmentAmount;
    const roi_percent = (totalReturn / investmentAmount) * 100;
    const moic_calc = finalValue / investmentAmount;
    
    setRoi(roi_percent);
    setMoic(moic_calc);
    setProjectedValue(finalValue);
    
    // Calculate IRR (simplified)
    const irr_calc = (Math.pow(moic_calc, 1 / timeHorizon) - 1) * 100;
    setIrr(irr_calc);
    
    // Set break-even year
    setBreakEvenYear(breakEvenYear_temp || timeHorizon + 1);
    
    // Calculate survival probability based on risk and time
    const survivalBase = 0.95 - (baseRisk * 0.3);
    const survivalTimeFactor = Math.pow(0.97, timeHorizon);
    const survivalAppetiteFactor = multiplier.success;
    const survivalProb = Math.min(95, Math.max(60, (survivalBase * survivalTimeFactor * survivalAppetiteFactor * 100)));
    setSurvivalProbability(Math.round(survivalProb));
    
    // Calculate risk-adjusted return (Sharpe-like ratio)
    const riskFreeRate = 3; // 3% risk-free rate
    const volatility = baseRisk * 30 * multiplier.volatility;
    const sharpe = (irr_calc - riskFreeRate) / volatility;
    setRiskAdjustedReturn(sharpe);
    
    // Generate scenarios
    setScenarios([
      {
        name: 'Base Case',
        probability: 60,
        return: Math.round(roi_percent * 0.8),
        value: Math.round(finalValue * 0.8 / 1000000 * 10) / 10,
        color: '#00E676'
      },
      {
        name: 'Bull Case',
        probability: 25,
        return: Math.round(roi_percent * 1.5),
        value: Math.round(finalValue * 1.5 / 1000000 * 10) / 10,
        color: '#2196F3'
      },
      {
        name: 'Bear Case',
        probability: 15,
        return: Math.round(roi_percent * 0.4),
        value: Math.round(finalValue * 0.4 / 1000000 * 10) / 10,
        color: '#FF9800'
      }
    ]);
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const getReturnColor = (value) => {
    if (value > 50) return '#00E676';
    if (value > 20) return '#2196F3';
    if (value > 0) return '#FF9800';
    return '#FF5252';
  };

  const getRiskColor = (probability) => {
    if (probability > 80) return '#00E676';
    if (probability > 60) return '#2196F3';
    if (probability > 40) return '#FF9800';
    return '#FF5252';
  };

  return (
    <Box sx={{ 
      bgcolor: '#0A0A0A',
      color: '#FFFFFF',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              startIcon={<ArrowLeftOutlined />}
              sx={{ color: '#00E676' }}
              onClick={() => navigate(`/dashboard/analysis/${startupId}`)}
            >
              Back to Analysis
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Investment Simulator
            </Typography>
            <Chip 
              label={startup.name}
              sx={{ 
                bgcolor: 'rgba(0, 230, 118, 0.1)', 
                color: '#00E676',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                fontWeight: 500
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Download Simulation">
              <IconButton sx={{ color: '#FFFFFF', '&:hover': { color: '#00E676' } }}>
                <DownloadOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Simulation">
              <IconButton sx={{ color: '#FFFFFF', '&:hover': { color: '#00E676' } }}>
                <ShareAltOutlined />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Main Simulator Grid */}
        <Grid container spacing={3}>
          {/* Input Panel */}
          <Grid item xs={12} md={4}>
            <MainCard sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A', position: 'sticky', top: 20 }}>
              <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 3 }}>
                <ExperimentOutlined style={{ marginRight: 8, color: '#00E676' }} />
                Investment Parameters
              </Typography>

              <Stack spacing={4}>
                {/* Investment Amount */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Investment Amount
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#00E676', fontWeight: 600 }}>
                      {formatCurrency(investmentAmount)}
                    </Typography>
                  </Stack>
                  <Slider
                    value={investmentAmount}
                    onChange={(e, val) => setInvestmentAmount(val)}
                    min={100000}
                    max={5000000}
                    step={100000}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatCurrency(value)}
                    sx={{
                      color: '#00E676',
                      '& .MuiSlider-thumb': { bgcolor: '#00E676' },
                      '& .MuiSlider-track': { bgcolor: '#00E676' }
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>$100K</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>$5M</Typography>
                  </Stack>
                </Box>

                {/* Time Horizon */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Time Horizon
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#00E676', fontWeight: 600 }}>
                      {timeHorizon} years
                    </Typography>
                  </Stack>
                  <Slider
                    value={timeHorizon}
                    onChange={(e, val) => setTimeHorizon(val)}
                    min={1}
                    max={10}
                    step={1}
                    valueLabelDisplay="auto"
                    sx={{
                      color: '#00E676',
                      '& .MuiSlider-thumb': { bgcolor: '#00E676' },
                      '& .MuiSlider-track': { bgcolor: '#00E676' }
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>1 year</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>10 years</Typography>
                  </Stack>
                </Box>

                {/* Risk Appetite */}
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                    Risk Appetite
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={riskAppetite}
                      onChange={(e) => setRiskAppetite(e.target.value)}
                    >
                      <FormControlLabel 
                        value="conservative" 
                        control={<Radio sx={{ color: '#00E676', '&.Mui-checked': { color: '#00E676' } }} />} 
                        label={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <SafetyOutlined style={{ color: '#00E676' }} />
                            <Typography sx={{ color: '#FFFFFF' }}>Conservative</Typography>
                            <Chip label="Lower returns, higher safety" size="small" sx={{ bgcolor: 'rgba(0,230,118,0.1)', color: '#00E676', fontSize: '0.6rem' }} />
                          </Stack>
                        } 
                      />
                      <FormControlLabel 
                        value="moderate" 
                        control={<Radio sx={{ color: '#FF9800', '&.Mui-checked': { color: '#FF9800' } }} />} 
                        label={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <RiseOutlined style={{ color: '#FF9800' }} />
                            <Typography sx={{ color: '#FFFFFF' }}>Moderate</Typography>
                            <Chip label="Balanced risk/return" size="small" sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#FF9800', fontSize: '0.6rem' }} />
                          </Stack>
                        } 
                      />
                      <FormControlLabel 
                        value="aggressive" 
                        control={<Radio sx={{ color: '#FF5252', '&.Mui-checked': { color: '#FF5252' } }} />} 
                        label={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <StockOutlined style={{ color: '#FF5252' }} />
                            <Typography sx={{ color: '#FFFFFF' }}>Aggressive</Typography>
                            <Chip label="Higher returns, higher risk" size="small" sx={{ bgcolor: 'rgba(255,82,82,0.1)', color: '#FF5252', fontSize: '0.6rem' }} />
                          </Stack>
                        } 
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* Run Simulation Button */}
                <Button
                  variant="contained"
                  size="large"
                  onClick={runSimulation}
                  startIcon={<ExperimentOutlined />}
                  sx={{
                    bgcolor: '#00E676',
                    color: '#000000',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': { bgcolor: '#00C853' }
                  }}
                >
                  Run Simulation
                </Button>

                {/* Startup Snapshot */}
                <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid #2A2A2A' }}>
                  <Typography variant="subtitle2" sx={{ color: '#00E676', mb: 2 }}>
                    Startup Snapshot
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Stage</Typography>
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{startup.stage}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Valuation</Typography>
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{startup.valuation}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Revenue (TTM)</Typography>
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{startup.revenue}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Growth</Typography>
                      <Typography variant="body2" sx={{ color: '#00E676' }}>+{startup.growth}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Burn Rate</Typography>
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{startup.burnRate}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Runway</Typography>
                      <Typography variant="body2" sx={{ color: '#FF9800' }}>{startup.runway} months</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            </MainCard>
          </Grid>

          {/* Results Panel */}
          <Grid item xs={12} md={8}>
            {!simulationRun ? (
              <MainCard sx={{ 
                bgcolor: '#121212', 
                border: '1px solid #2A2A2A',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8
              }}>
                <Stack alignItems="center" spacing={2}>
                  <LineChartOutlined style={{ fontSize: '4rem', color: '#00E676' }} />
                  <Typography variant="h5" sx={{ color: '#FFFFFF', textAlign: 'center' }}>
                    Adjust parameters and run simulation
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                    See projected ROI, break-even timeline, and risk metrics
                  </Typography>
                </Stack>
              </MainCard>
            ) : (
              <Stack spacing={3}>
                {/* Key Metrics Cards */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MainCard sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A' }}>
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>ROI</Typography>
                        <Typography variant="h4" sx={{ color: getReturnColor(roi) }}>
                          {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          MOIC: {moic.toFixed(2)}x
                        </Typography>
                      </Stack>
                    </MainCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MainCard sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A' }}>
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>IRR</Typography>
                        <Typography variant="h4" sx={{ color: getReturnColor(irr) }}>
                          {irr.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          Annualized return
                        </Typography>
                      </Stack>
                    </MainCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MainCard sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A' }}>
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Break-even</Typography>
                        <Typography variant="h4" sx={{ color: breakEvenYear <= timeHorizon ? '#00E676' : '#FF5252' }}>
                          {breakEvenYear <= timeHorizon ? `Year ${breakEvenYear}` : 'Not reached'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          Within {timeHorizon}-year horizon
                        </Typography>
                      </Stack>
                    </MainCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MainCard sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A' }}>
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Survival Probability</Typography>
                        <Typography variant="h4" sx={{ color: getRiskColor(survivalProbability) }}>
                          {survivalProbability}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          Through {timeHorizon} years
                        </Typography>
                      </Stack>
                    </MainCard>
                  </Grid>
                </Grid>

                {/* ROI Projection Graph */}
                <MainCard sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A' }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 3 }}>
                    ROI Projection
                  </Typography>
                  
                  <Box sx={{ height: 250, position: 'relative', mb: 2 }}>
                    <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ height: 200 }}>
                      {roiProjection.map((year, index) => {
                        const maxValue = Math.max(...roiProjection.map(y => y.value));
                        const height = (year.value / maxValue) * 180;
                        return (
                          <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                            <Box sx={{ 
                              height: height, 
                              bgcolor: year.value > year.investment/1000000 ? '#00E676' : '#FF9800',
                              opacity: 0.8,
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.3s',
                              position: 'relative'
                            }}>
                              <Tooltip title={`$${year.value}M`}>
                                <Box sx={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)' }}>
                                  <Typography variant="caption" sx={{ color: '#FFFFFF' }}>
                                    ${year.value}M
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, display: 'block' }}>
                              {year.year}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>

                  <Divider sx={{ borderColor: '#2A2A2A', my: 2 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00E676' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Projected Value</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF9800' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Below Investment</Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#00E676' }}>
                      Final Value: ${projectedValue > 1000000 ? (projectedValue/1000000).toFixed(1) + 'M' : (projectedValue/1000).toFixed(0) + 'K'}
                    </Typography>
                  </Stack>
                </MainCard>

                {/* Scenario Analysis & Risk Metrics */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MainCard sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A' }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                        Scenario Analysis
                      </Typography>
                      
                      {scenarios.map((scenario, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: scenario.color }} />
                              <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{scenario.name}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="body2" sx={{ color: getReturnColor(scenario.return) }}>
                                {scenario.return > 0 ? '+' : ''}{scenario.return}%
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                                ${scenario.value}M
                              </Typography>
                            </Stack>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={scenario.probability * 2}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': { bgcolor: scenario.color },
                              height: 4,
                              borderRadius: 2
                            }} 
                          />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                            {scenario.probability}% probability
                          </Typography>
                        </Box>
                      ))}
                    </MainCard>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MainCard sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A' }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                        Risk-Adjusted Metrics
                      </Typography>
                      
                      <Stack spacing={2}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Risk-Adjusted Return (Sharpe)</Typography>
                            <Typography variant="body2" sx={{ color: riskAdjustedReturn > 1 ? '#00E676' : riskAdjustedReturn > 0.5 ? '#FF9800' : '#FF5252' }}>
                              {riskAdjustedReturn.toFixed(2)}
                            </Typography>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(riskAdjustedReturn * 50, 100)}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': { 
                                bgcolor: riskAdjustedReturn > 1 ? '#00E676' : riskAdjustedReturn > 0.5 ? '#FF9800' : '#FF5252' 
                              },
                              height: 4,
                              borderRadius: 2
                            }} 
                          />
                        </Box>

                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Volatility</Typography>
                            <Typography variant="body2" sx={{ color: riskAppetite === 'aggressive' ? '#FF5252' : '#FF9800' }}>
                              {riskAppetite === 'aggressive' ? 'High' : riskAppetite === 'moderate' ? 'Medium' : 'Low'}
                            </Typography>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={riskAppetite === 'aggressive' ? 80 : riskAppetite === 'moderate' ? 50 : 25}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': { 
                                bgcolor: riskAppetite === 'aggressive' ? '#FF5252' : riskAppetite === 'moderate' ? '#FF9800' : '#00E676' 
                              },
                              height: 4,
                              borderRadius: 2
                            }} 
                          />
                        </Box>

                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Downside Protection</Typography>
                            <Typography variant="body2" sx={{ color: riskAppetite === 'conservative' ? '#00E676' : '#FF9800' }}>
                              {riskAppetite === 'conservative' ? 'Strong' : riskAppetite === 'moderate' ? 'Moderate' : 'Weak'}
                            </Typography>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={riskAppetite === 'conservative' ? 75 : riskAppetite === 'moderate' ? 50 : 25}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': { 
                                bgcolor: riskAppetite === 'conservative' ? '#00E676' : riskAppetite === 'moderate' ? '#FF9800' : '#FF5252' 
                              },
                              height: 4,
                              borderRadius: 2
                            }} 
                          />
                        </Box>
                      </Stack>

                      <Divider sx={{ borderColor: '#2A2A2A', my: 2 }} />

                      <Alert 
                        severity={survivalProbability > 70 ? 'success' : survivalProbability > 50 ? 'warning' : 'error'}
                        sx={{ 
                          bgcolor: survivalProbability > 70 ? 'rgba(0,230,118,0.1)' : survivalProbability > 50 ? 'rgba(255,152,0,0.1)' : 'rgba(255,82,82,0.1)',
                          border: `1px solid ${survivalProbability > 70 ? '#00E676' : survivalProbability > 50 ? '#FF9800' : '#FF5252'}40`,
                          '& .MuiAlert-icon': { 
                            color: survivalProbability > 70 ? '#00E676' : survivalProbability > 50 ? '#FF9800' : '#FF5252' 
                          }
                        }}
                      >
                        <AlertTitle sx={{ 
                          color: survivalProbability > 70 ? '#00E676' : survivalProbability > 50 ? '#FF9800' : '#FF5252',
                          fontWeight: 600
                        }}>
                          Investment Recommendation
                        </AlertTitle>
                        <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                          {survivalProbability > 70 
                            ? `Strong investment opportunity with ${survivalProbability}% survival probability. Risk-adjusted return looks favorable.`
                            : survivalProbability > 50
                            ? `Moderate opportunity. Consider lower investment amount or shorter time horizon.`
                            : `High risk investment. Only suitable for aggressive investors with high risk tolerance.`
                          }
                        </Typography>
                      </Alert>
                    </MainCard>
                  </Grid>
                </Grid>

                {/* Exit Strategy & Timeline */}
                <MainCard sx={{ bgcolor: '#121212', border: '1px solid #2A2A2A' }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                    Exit Strategy Timeline
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid #2A2A2A', textAlign: 'center' }}>
                        <CalendarOutlined style={{ color: '#00E676', fontSize: '1.5rem', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 1 }}>Year {Math.ceil(timeHorizon * 0.3)}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Series C/D</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid #2A2A2A', textAlign: 'center' }}>
                        <CalendarOutlined style={{ color: '#FF9800', fontSize: '1.5rem', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 1 }}>Year {Math.ceil(timeHorizon * 0.6)}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Pre-IPO</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid #2A2A2A', textAlign: 'center' }}>
                        <CalendarOutlined style={{ color: '#FF5252', fontSize: '1.5rem', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 1 }}>Year {timeHorizon}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>IPO/Acquisition</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid #2A2A2A', textAlign: 'center' }}>
                        <DollarOutlined style={{ color: '#00E676', fontSize: '1.5rem', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 1 }}>
                          ${(projectedValue / 1000000).toFixed(1)}M
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Exit Value</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </MainCard>
              </Stack>
            )}
          </Grid>
        </Grid>

        {/* Footer */}
        <Divider sx={{ borderColor: '#2A2A2A', my: 4 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © All rights reserved CodedThemes
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
            Investment Simulator v1.0 - Monte Carlo Powered
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}