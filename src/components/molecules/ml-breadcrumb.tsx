/**
 * Molecule: MlBreadcrumb
 *
 * Navigation breadcrumb trail: "< Costos / Grupos / Terceros"
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';

interface MlBreadcrumbProps {
  segments: string[];
  onBack?: () => void;
  className?: string;
}

export const MlBreadcrumb = memo<MlBreadcrumbProps>(
  ({ segments, onBack, className }) => {
    return (
      <Pressable
        onPress={onBack}
        className={`flex-row items-center gap-1 ${className ?? ''}`}
      >
        <AtIcon name="chevron-left" size="md" color="#4A5568" />
        <View className="flex-row items-center gap-1">
          {segments.map((seg, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <AtTypography variant="body" color="#8892A4">
                  {' / '}
                </AtTypography>
              )}
              <AtTypography
                variant={i === segments.length - 1 ? 'bodyBold' : 'body'}
                color={i === segments.length - 1 ? '#1A1F36' : '#4A5568'}
              >
                {seg}
              </AtTypography>
            </React.Fragment>
          ))}
        </View>
      </Pressable>
    );
  },
);

MlBreadcrumb.displayName = 'MlBreadcrumb';
