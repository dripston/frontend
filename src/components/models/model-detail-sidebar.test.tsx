import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ModelDetailSidebar } from './model-detail-sidebar';
import { buildModelDetail } from '@/lib/model-detail';
import { models } from '@/lib/models';

const model = models[0]!;
const detail = buildModelDetail(model);

describe('ModelDetailSidebar', () => {
  it('shows the download count', () => {
    render(<ModelDetailSidebar model={model} detail={detail} />);
    expect(screen.getByText(model.downloads.toLocaleString('en-US'))).toBeInTheDocument();
  });

  it('shows the parameter count and tensor type', () => {
    render(<ModelDetailSidebar model={model} detail={detail} />);
    expect(screen.getByText(`${model.params} params`)).toBeInTheDocument();
    expect(screen.getByText(detail.tensorType)).toBeInTheDocument();
  });

  it('lists every model tree branch', () => {
    render(<ModelDetailSidebar model={model} detail={detail} />);
    for (const label of ['Adapters', 'Finetunes', 'Merges', 'Quantizations']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('lists the spaces using the model', () => {
    render(<ModelDetailSidebar model={model} detail={detail} />);
    for (const space of detail.spaces) {
      expect(screen.getByText(space)).toBeInTheDocument();
    }
  });

  it('renders every evaluation score', () => {
    render(<ModelDetailSidebar model={model} detail={detail} />);
    for (const entry of detail.evals) {
      expect(screen.getByText(entry.suite)).toBeInTheDocument();
    }
  });

  it('falls back when a model has no published parameters', () => {
    render(<ModelDetailSidebar model={{ ...model, params: null }} detail={detail} />);
    expect(screen.getByText('n/a params')).toBeInTheDocument();
  });
});
