import * as React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  FlexItemModifiers
} from '@patternfly/react-core';
import { warnYAML } from './modals';
import { TechPreviewBadge } from '../../../../../console-shared/src';
import { Pipeline } from '../../../utils/pipeline-augment';
import { goToYAML } from './utils';
import { ResourcePlural } from '../../../../../../public/components/utils/lang/resource-plural';

import './PipelineBuilderHeader.scss';

type PipelineBuilderHeaderProps = {
  existingPipeline: Pipeline;
  namespace: string;
  t: any;
};

const PipelineBuilderHeader: React.FC<PipelineBuilderHeaderProps> = props => {
  const { existingPipeline, namespace, t } = props;

  return (
    <div className="odc-pipeline-builder-header">
      <Flex className="odc-pipeline-builder-header__content">
        <FlexItem breakpointMods={[{ modifier: FlexItemModifiers.grow }]}>
          <h1 className="odc-pipeline-builder-header__title">
            {t('ADDITIONAL:CREATEBUTTON', {
              something: ResourcePlural('Pipeline', t)
            })}
          </h1>
        </FlexItem>
        {/* <FlexItem>
          <Button
            variant="link"
            onClick={() => {
              warnYAML(() => goToYAML(existingPipeline, namespace));
            }}
          >
            Edit YAML
          </Button>
        </FlexItem>
        <FlexItem>
          <TechPreviewBadge />
        </FlexItem> */}
      </Flex>
      <hr />
    </div>
  );
};

export default PipelineBuilderHeader;
