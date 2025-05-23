import React from 'react';
import { Flex, Box, FlexProps } from '@chakra-ui/react';
import MyIcon from '../Icon';
import { useTranslation } from 'next-i18next';

type Props = FlexProps & {
  text?: string | React.ReactNode;
  iconSize?: string | number;
};

const EmptyTip = ({ text, iconSize = '40px', ...props }: Props) => {
  const { t } = useTranslation();
  return (
    <Flex mt={5} flexDirection={'column'} alignItems={'center'} py={'10vh'} {...props}>
      <Box
        borderRadius="lg"
        p={3}
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="1px solid #E0E0E0"
        borderStyle="dashed"
      >
        <MyIcon name="empty" w={iconSize} h={iconSize} color={'transparent'} />
      </Box>
      <Box mt={2} color={'myGray.500'} fontSize={'sm'}>
        {text || t('common:common.empty.Common Tip')}
      </Box>
    </Flex>
  );
};

export default EmptyTip;
