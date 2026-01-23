import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { createCharacter } from '@/api';
import type { CharacterCreationRequest } from '@/api';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface FormErrors {
  name?: string;
  race?: string;
  class?: string;
  adventurePrompt?: string;
  submit?: string;
}

export default function NewCharacterPage() {
  const navigate = useNavigate();
  const { getIdToken } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    class: '',
    adventurePrompt: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 1) {
      newErrors.name = 'Name must be at least 1 character';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }

    // Race validation
    if (!formData.race.trim()) {
      newErrors.race = 'Race is required';
    } else if (formData.race.trim().length < 1) {
      newErrors.race = 'Race must be at least 1 character';
    } else if (formData.race.length > 50) {
      newErrors.race = 'Race must be 50 characters or less';
    }

    // Class validation
    if (!formData.class.trim()) {
      newErrors.class = 'Class is required';
    } else if (formData.class.trim().length < 1) {
      newErrors.class = 'Class must be at least 1 character';
    } else if (formData.class.length > 50) {
      newErrors.class = 'Class must be 50 characters or less';
    }

    // Adventure prompt validation (optional field)
    if (formData.adventurePrompt && formData.adventurePrompt.length > 2000) {
      newErrors.adventurePrompt = 'Adventure prompt must be 2000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setLoadingState('loading');
    setErrors({});

    try {
      // Get Firebase ID token
      const token = await getIdToken();
      if (!token) {
        setErrors({ submit: 'Authentication required. Please log in again.' });
        setLoadingState('error');
        return;
      }

      // Create character request
      const request: CharacterCreationRequest = {
        name: formData.name.trim(),
        race: formData.race.trim(),
        class_name: formData.class.trim(),
        custom_prompt: formData.adventurePrompt.trim() || null,
      };

      // Call dungeon-master API (which handles journey-log linkage automatically)
      const response = await createCharacter(request);

      setLoadingState('success');

      // Navigate to game page with initial scenario in state
      navigate(`/game/${response.character_id}`, {
        state: {
          initialScenario: {
            narrative: response.narrative,
            character_id: response.character_id,
          },
        },
      });
    } catch (err) {
      console.error('Character creation failed:', err);
      setLoadingState('error');

      // Handle specific error types
      if (err && typeof err === 'object' && 'status' in err) {
        const status = (err as { status: number }).status;
        
        if (status === 401 || status === 403) {
          setErrors({ submit: 'Authentication failed. Please log in again.' });
        } else if (status === 422) {
          // Validation error from server
          const body = (err as { body?: { detail?: string | Array<{ msg: string; loc: string[] }> } }).body;
          if (body?.detail) {
            if (typeof body.detail === 'string') {
              setErrors({ submit: body.detail });
            } else if (Array.isArray(body.detail)) {
              // Map validation errors to form fields
              const fieldErrors: FormErrors = {};
              body.detail.forEach((error: { msg: string; loc: string[] }) => {
                const field = error.loc[error.loc.length - 1];
                if (field === 'name') fieldErrors.name = error.msg;
                else if (field === 'race') fieldErrors.race = error.msg;
                else if (field === 'class_name') fieldErrors.class = error.msg;
                else if (field === 'custom_prompt') fieldErrors.adventurePrompt = error.msg;
              });
              setErrors(fieldErrors);
            }
          } else {
            setErrors({ submit: 'Validation failed. Please check your input.' });
          }
        } else if (status === 429) {
          setErrors({ submit: 'Too many requests. Please try again later.' });
        } else if (status >= 500) {
          setErrors({ submit: 'Server error. Please try again later or contact support.' });
        } else {
          setErrors({ submit: 'Failed to create character. Please try again.' });
        }
      } else if (err instanceof Error) {
        setErrors({ submit: err.message });
      } else {
        setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field === 'class' ? 'class' : field]) {
      setErrors(prev => ({ ...prev, [field === 'class' ? 'class' : field]: undefined }));
    }
  };

  const isFormDisabled = loadingState === 'loading';

  return (
    <div className="new-character-page">
      <div className="page-header">
        <h1>Create New Character</h1>
        <p className="page-description">
          Begin your adventure by creating a new character. Fill in the details below to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="character-form">
        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Character Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isFormDisabled}
            placeholder="Enter character name"
            maxLength={100}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <span id="name-error" className="error-message" role="alert">
              {errors.name}
            </span>
          )}
          <span className="field-hint">1-100 characters</span>
        </div>

        {/* Race Field */}
        <div className="form-group">
          <label htmlFor="race" className="form-label">
            Race <span className="required">*</span>
          </label>
          <input
            type="text"
            id="race"
            name="race"
            className={`form-input ${errors.race ? 'input-error' : ''}`}
            value={formData.race}
            onChange={(e) => handleInputChange('race', e.target.value)}
            disabled={isFormDisabled}
            placeholder="e.g., Human, Elf, Dwarf, Orc"
            maxLength={50}
            aria-invalid={!!errors.race}
            aria-describedby={errors.race ? 'race-error' : undefined}
          />
          {errors.race && (
            <span id="race-error" className="error-message" role="alert">
              {errors.race}
            </span>
          )}
          <span className="field-hint">1-50 characters</span>
        </div>

        {/* Class Field */}
        <div className="form-group">
          <label htmlFor="class" className="form-label">
            Class <span className="required">*</span>
          </label>
          <input
            type="text"
            id="class"
            name="class"
            className={`form-input ${errors.class ? 'input-error' : ''}`}
            value={formData.class}
            onChange={(e) => handleInputChange('class', e.target.value)}
            disabled={isFormDisabled}
            placeholder="e.g., Warrior, Wizard, Rogue, Cleric"
            maxLength={50}
            aria-invalid={!!errors.class}
            aria-describedby={errors.class ? 'class-error' : undefined}
          />
          {errors.class && (
            <span id="class-error" className="error-message" role="alert">
              {errors.class}
            </span>
          )}
          <span className="field-hint">1-50 characters</span>
        </div>

        {/* Adventure Prompt Field */}
        <div className="form-group">
          <label htmlFor="adventurePrompt" className="form-label">
            Adventure Prompt <span className="optional">(Optional)</span>
          </label>
          <textarea
            id="adventurePrompt"
            name="adventurePrompt"
            className={`form-textarea ${errors.adventurePrompt ? 'input-error' : ''}`}
            value={formData.adventurePrompt}
            onChange={(e) => handleInputChange('adventurePrompt', e.target.value)}
            disabled={isFormDisabled}
            placeholder="Describe the world or setting for your adventure (e.g., 'A dark fantasy world where the sun has vanished')"
            maxLength={2000}
            rows={4}
            aria-invalid={!!errors.adventurePrompt}
            aria-describedby={errors.adventurePrompt ? 'adventurePrompt-error' : undefined}
          />
          {errors.adventurePrompt && (
            <span id="adventurePrompt-error" className="error-message" role="alert">
              {errors.adventurePrompt}
            </span>
          )}
          <span className="field-hint">
            Optional. Customize the world setting or opening scene (max 2000 characters)
          </span>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="form-error-banner" role="alert">
            <strong>Error:</strong> {errors.submit}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => navigate('/app')}
            disabled={isFormDisabled}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={isFormDisabled}
          >
            {loadingState === 'loading' ? (
              <>
                <span className="button-spinner" />
                Creating...
              </>
            ) : (
              'Create Adventure'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
