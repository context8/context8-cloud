import React, { useState } from 'react';
import { Toggle } from '../Common/Toggle';
import { DashButton } from '@/components/dashboard-ui/DashButton';

export interface SolutionFormData {
  title: string;
  errorMessage: string;
  errorType: string;
  context: string;
  rootCause: string;
  solution: string;
  tags: string;
  isPublic?: boolean;
}

export interface SolutionFormProps {
  onSubmit: (data: SolutionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SolutionForm: React.FC<SolutionFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<SolutionFormData>({
    title: '',
    errorMessage: '',
    errorType: '',
    context: '',
    rootCause: '',
    solution: '',
    tags: '',
    isPublic: false,
  });

  const handleChange = (field: keyof SolutionFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const labelClass = 'block text-xs font-mono uppercase tracking-widest text-foreground-light';
  const inputClass = 'dash-input mt-2 h-10';
  const textareaClass = 'dash-input mt-2 h-auto min-h-[96px] py-2';
  const selectClass = 'dash-input mt-2 h-10';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={inputClass}
          placeholder="Brief description of the error"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className={labelClass}>Error message</label>
        <textarea
          required
          rows={3}
          value={formData.errorMessage}
          onChange={(e) => handleChange('errorMessage', e.target.value)}
          className={textareaClass}
          placeholder="The actual error message"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className={labelClass}>Error type</label>
        <select
          required
          value={formData.errorType}
          onChange={(e) => handleChange('errorType', e.target.value)}
          className={selectClass}
          disabled={isLoading}
        >
          <option value="">Select error type</option>
          <option value="feature_request">Feature Request</option>
          <option value="question_support">Question/Support</option>
          <option value="api_integration">API/Integration</option>
          <option value="ui_ux">UI/UX</option>
          <option value="build_ci">Build/CI</option>
          <option value="install_setup">Install/Setup</option>
          <option value="docs_request">Docs Request</option>
          <option value="compatibility">Compatibility</option>
          <option value="licensing">Licensing</option>
          <option value="data_quality">Data Quality</option>
          <option value="ops_infra">Ops/Infra</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Context</label>
        <textarea
          required
          rows={3}
          value={formData.context}
          onChange={(e) => handleChange('context', e.target.value)}
          className={textareaClass}
          placeholder="When and where the error occurred"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className={labelClass}>Root cause</label>
        <textarea
          required
          rows={3}
          value={formData.rootCause}
          onChange={(e) => handleChange('rootCause', e.target.value)}
          className={textareaClass}
          placeholder="Why the error happened"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className={labelClass}>Solution</label>
        <textarea
          required
          rows={4}
          value={formData.solution}
          onChange={(e) => handleChange('solution', e.target.value)}
          className={textareaClass}
          placeholder="How you fixed it"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className={labelClass}>Tags</label>
        <input
          type="text"
          required
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          className={inputClass}
          placeholder="Comma-separated tags (e.g., react, typescript, hooks)"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Toggle
            checked={formData.isPublic || false}
            onChange={(checked) => handleChange('isPublic', checked)}
            label="Make this solution public"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <DashButton
          type="submit"
          disabled={isLoading}
          variant="primary"
        >
          Create Solution
        </DashButton>
        <DashButton
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          variant="default"
        >
          Cancel
        </DashButton>
      </div>
    </form>
  );
};
