import * as React from 'react';
import * as _ from 'lodash-es';

import { Cog, kindObj, LabelList, ResourceLink, Selector, Timestamp } from './index';
import { referenceForOwnerRef, K8sResourceKind, referenceFor } from '../../module/k8s';
import { useTranslation } from 'react-i18next';
import { PipelineDiagramComponent, PipelineRunDiagramComponent } from '../diagramComponent';
import { PipelineVisualization } from '../../../packages/dev-console/src/components/pipelines/detail-page-tabs/pipeline-details/PipelineVisualization';
import { PipelineRunVisualization } from '../../../packages/dev-console/src/components/pipelineruns/detail-page-tabs/PipelineRunVisualization';

export const pluralize = (i: number, singular: string, plural: string = `${singular}s`) => `${i || 0} ${i === 1 ? singular : plural}`;

export const detailsPage = <T extends {}>(Component: React.ComponentType<T>) =>
  function DetailsPage(props: T) {
    return <Component {...props} />;
  };

export const ResourceSummary: React.SFC<ResourceSummaryProps> = ({ children, resource, showPodSelector = true, showNodeSelector = true, showAnnotations = true, podSelector = 'spec.selector' }) => {
  const { metadata, type } = resource;
  const { t } = useTranslation();
  const owners = (_.get(metadata, 'ownerReferences') || []).map((o, i) => <ResourceLink key={i} kind={referenceForOwnerRef(o)} name={o.name} namespace={metadata.namespace} title={o.uid} />);

  return (
    <dl className="co-m-pane__details">
      {/* {resource.kind === 'Pipeline' && <PipelineDiagramComponent namespace={metadata.namespace} data={resource.spec.tasks} />}
      {resource.kind === 'PipelineRun' && <PipelineRunDiagramComponent namespace={metadata.namespace} data={resource.status} />} */}
      <dt>{t('CONTENT:NAME')}</dt>
      <dd>{metadata.name || '-'}</dd>
      {metadata.namespace ? <dt>{t('CONTENT:NAMESPACE')}</dt> : null}
      {metadata.namespace ? (
        <dd>
          <ResourceLink kind="Namespace" name={metadata.namespace} title={metadata.uid} namespace={null} />
        </dd>
      ) : null}
      {type ? <dt>{t('CONTENT:TYPE')}</dt> : null}
      {type ? <dd>{type}</dd> : null}
      <dt>{t('CONTENT:LABELS')}</dt>
      <dd>
        <LabelList kind={referenceFor(resource)} labels={metadata.labels} />
      </dd>
      {showPodSelector && <dt>{t('CONTENT:PODSELECTOR')}</dt>}
      {showPodSelector && (
        <dd>
          <Selector selector={_.get(resource, podSelector)} namespace={_.get(resource, 'metadata.namespace')} />
        </dd>
      )}
      {showNodeSelector && <dt>{t('CONTENT:NODESELECTOR')}</dt>}
      {showNodeSelector && (
        <dd>
          <Selector kind="Node" selector={_.get(resource, 'spec.template.spec.nodeSelector')} />
        </dd>
      )}
      {showAnnotations && <dt>{t('CONTENT:ANNOTATIONS')}</dt>}
      {showAnnotations && (
        <dd>
          <a className="co-m-modal-link" onClick={Cog.factory.ModifyAnnotations(kindObj(resource.kind), resource).callback}>
            {t('PLURAL:ANNOTATION', { count: _.size(metadata.annotations) })}
          </a>
        </dd>
      )}
      {children}
      <dt>{t('CONTENT:CREATEDAT')}</dt>
      <dd>
        <Timestamp timestamp={metadata.creationTimestamp} t={t} />
      </dd>
      {owners.length ? <dt>{t('CONTENT:OWNER')}</dt> : null}
      {owners.length ? <dd>{owners}</dd> : null}
      {resource.kind === 'Pipeline' && <PipelineVisualization pipeline={resource} />}
      {resource.kind === 'PipelineRun' && <PipelineRunVisualization pipelineRun={resource} />}
      {resource.kind === 'PipelineRun' && !resource.status.pipelineSpec && <div style={{ padding: '10px' }}>Tekton version &gt;= 0.12.1 required for Pipelinerun visualization.</div>}
    </dl>
  );
};

export const ResourcePodCount: React.SFC<ResourcePodCountProps> = ({ resource }) => (
  <dl>
    <dt>Current Count</dt>
    <dd>{resource.status.replicas || 0}</dd>
    <dt>Desired Count</dt>
    <dd>{resource.spec.replicas || 0}</dd>
  </dl>
);

/* eslint-disable no-undef */
export type ResourceSummaryProps = {
  resource: K8sResourceKind;
  showPodSelector?: boolean;
  showNodeSelector?: boolean;
  showAnnotations?: boolean;
  podSelector?: string;
  children?: JSX.Element[];
};

export type ResourcePodCountProps = {
  resource: K8sResourceKind;
};
/* eslint-enable no-undef */

ResourceSummary.displayName = 'ResourceSummary';
ResourcePodCount.displayName = 'ResourcePodCount';
