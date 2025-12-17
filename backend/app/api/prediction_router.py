"""
Prediction API Router

Endpoints for time-series mental health trend prediction.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from ..services.prediction import predict_weekly_trend, PredictionResult

router = APIRouter(prefix="/prediction", tags=["Prediction"])


class ForecastRequest(BaseModel):
    """Request model for trend forecast"""
    phq9_history: list[float] = Field(
        ..., 
        description="Historical PHQ-9 scores (minimum 3 points)",
        min_length=1
    )
    voice_stress: Optional[list[float]] = Field(
        None,
        description="Optional voice stress levels (0-100)"
    )
    keystroke_anxiety: Optional[list[float]] = Field(
        None,
        description="Optional keystroke anxiety indices (0-100)"
    )


class ForecastResponse(BaseModel):
    """Response model for trend forecast"""
    success: bool
    predicted_scores: list[float]
    dates: list[str]
    confidence_lower: list[float]
    confidence_upper: list[float]
    trend_direction: str
    risk_level: str
    model_confidence: float
    interpretation: str


@router.post("/forecast", response_model=ForecastResponse)
async def forecast_trend(request: ForecastRequest) -> ForecastResponse:
    """
    Predict mental health trend for the next 7 days.
    
    Uses ensemble ML model (RandomForest + LinearRegression) to forecast
    future PHQ-9 scores based on historical data and optional biomarkers.
    
    Args:
        request: ForecastRequest containing historical PHQ-9 scores and optional biomarkers
        
    Returns:
        ForecastResponse with 7-day prediction and confidence intervals
    """
    try:
        result = await predict_weekly_trend(
            phq9_history=request.phq9_history,
            voice_stress=request.voice_stress,
            keystroke_anxiety=request.keystroke_anxiety,
        )
        
        # Generate human-readable interpretation
        interpretation = _generate_interpretation(result)
        
        return ForecastResponse(
            success=True,
            predicted_scores=result.predicted_scores,
            dates=result.dates,
            confidence_lower=result.confidence_lower,
            confidence_upper=result.confidence_upper,
            trend_direction=result.trend_direction,
            risk_level=result.risk_level,
            model_confidence=result.model_confidence,
            interpretation=interpretation,
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


def _generate_interpretation(result: PredictionResult) -> str:
    """Generate human-readable interpretation of prediction results"""
    
    trend_messages = {
        'improving': 'Based on the analysis, your mental health trajectory shows signs of improvement.',
        'stable': 'Your mental health indicators appear to be stable over the forecast period.',
        'worsening': 'The model detects a potential decline in mental health indicators. Consider seeking support.',
    }
    
    risk_messages = {
        'low': 'Current risk level is low. Continue with your positive practices.',
        'moderate': 'Moderate risk detected. Consider implementing stress-reduction techniques.',
        'high': 'Elevated risk indicators. Professional consultation is recommended.',
    }
    
    base_msg = trend_messages.get(result.trend_direction, '')
    risk_msg = risk_messages.get(result.risk_level, '')
    
    confidence_note = ''
    if result.model_confidence < 0.5:
        confidence_note = ' Note: Limited historical data affects prediction accuracy.'
    
    return f"{base_msg} {risk_msg}{confidence_note}"


@router.get("/demo")
async def demo_forecast() -> ForecastResponse:
    """
    Demo endpoint with sample data for testing.
    Returns a forecast based on synthetic PHQ-9 history.
    """
    # Synthetic demo data showing mild depression trend
    sample_phq9 = [7, 9, 8, 10, 11, 9, 10, 8, 9]
    sample_voice = [45, 50, 48, 55, 58, 52, 55, 50, 52]
    sample_keystroke = [25, 30, 28, 35, 38, 32, 35, 30, 32]
    
    result = await predict_weekly_trend(
        phq9_history=sample_phq9,
        voice_stress=sample_voice,
        keystroke_anxiety=sample_keystroke,
    )
    
    return ForecastResponse(
        success=True,
        predicted_scores=result.predicted_scores,
        dates=result.dates,
        confidence_lower=result.confidence_lower,
        confidence_upper=result.confidence_upper,
        trend_direction=result.trend_direction,
        risk_level=result.risk_level,
        model_confidence=result.model_confidence,
        interpretation=_generate_interpretation(result),
    )
