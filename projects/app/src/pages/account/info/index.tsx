import React, { useCallback } from 'react';
import {
  Box,
  Flex,
  Button,
  useDisclosure,
  useTheme,
  Input,
  Link,
  Grid,
  BoxProps
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { UserUpdateParams } from '@/types/user';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useUserStore } from '@/web/support/user/useUserStore';
import type { UserType } from '@fastgpt/global/support/user/type.d';
import dynamic from 'next/dynamic';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useTranslation } from 'next-i18next';
import Avatar from '@fastgpt/web/components/common/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { putUpdateMemberName } from '@/web/support/user/team/api';
import { getDocPath } from '@/web/common/system/doc';
import { StandardSubLevelEnum } from '@fastgpt/global/support/wallet/sub/constants';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import AccountContainer from '@/pageComponents/account/AccountContainer';
import { serviceSideProps } from '@/web/common/i18n/utils';
import TeamSelector from '@/pageComponents/account/TeamSelector';
import { getWorkorderURL } from '@/web/common/workorder/api';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useMount } from 'ahooks';
import MyDivider from '@fastgpt/web/components/common/MyDivider';

const ConversionModal = dynamic(() => import('@/pageComponents/account/info/ConversionModal'));
const UpdatePswModal = dynamic(() => import('@/pageComponents/account/info/UpdatePswModal'));
const UpdateContact = dynamic(() => import('@/components/support/user/inform/UpdateContactModal'));
const CommunityModal = dynamic(() => import('@/components/CommunityModal'));

const Info = () => {
  const { isPc } = useSystem();
  const { initUserInfo } = useUserStore();
  const { isOpen: isOpenContact, onClose: onCloseContact, onOpen: onOpenContact } = useDisclosure();

  useMount(() => {
    initUserInfo();
  });

  return (
    <AccountContainer>
      <Box py={[3, '28px']} px={[5, 10]} mx={'auto'}>
        {isPc ? (
          <Flex justifyContent={'center'} maxW={'1080px'}>
            <Box flex={'0 0 330px'}>
              <MyInfo onOpenContact={onOpenContact} />
              {/* <Box mt={6}>
                <Other onOpenContact={onOpenContact} />
              </Box> */}
            </Box>
          </Flex>
        ) : (
          <>
            <MyInfo onOpenContact={onOpenContact} />
            {/* <Other onOpenContact={onOpenContact} /> */}
          </>
        )}
      </Box>
      {isOpenContact && <CommunityModal onClose={onCloseContact} />}
    </AccountContainer>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['account', 'account_info', 'user']))
    }
  };
}

export default React.memo(Info);

const MyInfo = ({ onOpenContact }: { onOpenContact: () => void }) => {
  const theme = useTheme();
  const { feConfigs } = useSystemStore();
  const { t } = useTranslation();
  const { userInfo, updateUserInfo, teamPlanStatus, initUserInfo } = useUserStore();
  const { reset } = useForm<UserUpdateParams>({
    defaultValues: userInfo as UserType
  });
  const { isPc } = useSystem();
  const { toast } = useToast();

  const {
    isOpen: isOpenConversionModal,
    onClose: onCloseConversionModal,
    onOpen: onOpenConversionModal
  } = useDisclosure();
  const {
    isOpen: isOpenUpdatePsw,
    onClose: onCloseUpdatePsw,
    onOpen: onOpenUpdatePsw
  } = useDisclosure();
  const {
    isOpen: isOpenUpdateContact,
    onClose: onCloseUpdateContact,
    onOpen: onOpenUpdateContact
  } = useDisclosure();
  const {
    File,
    onOpen: onOpenSelectFile,
    onSelectImage
  } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

  const onclickSave = useCallback(
    async (data: UserType) => {
      await updateUserInfo({
        avatar: data.avatar,
        timezone: data.timezone
      });
      reset(data);
      toast({
        title: t('account_info:update_success_tip'),
        status: 'success'
      });
    },
    [reset, t, toast, updateUserInfo]
  );

  const labelStyles: BoxProps = {
    flex: '0 0 80px',
    color: 'var(--light-general-on-surface-lowest, var(--Gray-Modern-500, #667085))',
    fontFamily: '"PingFang SC"',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20px',
    letterSpacing: '0.25px'
  };

  const titleStyles: BoxProps = {
    color: 'var(--light-general-on-surface, var(--Gray-Modern-900, #111824))',
    fontFamily: '"PingFang SC"',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '24px',
    letterSpacing: '0.15px'
  };

  const isSyncMember = feConfigs.register_method?.includes('sync');
  return (
    <Box>
      {/* user info */}
      {isPc && (
        <Flex alignItems={'center'} h={'30px'} {...titleStyles}>
          <MyIcon mr={2} name={'core/dataset/fileCollection'} w={'1.25rem'} />
          {t('account_info:general_info')}
        </Flex>
      )}

      <Box mt={[0, 6]} fontSize={'sm'}>
        <Flex alignItems={'center'}>
          <Box {...labelStyles}>{t('account_info:user_account')}&nbsp;</Box>
          <Box flex={1}>{userInfo?.username}</Box>
        </Flex>
        {feConfigs?.isPlus && (
          <Flex mt={4} alignItems={'center'}>
            <Box {...labelStyles}>{t('account_info:password')}&nbsp;</Box>
            <Box flex={1}>*****</Box>
            <Button size={'sm'} variant={'whitePrimary'} onClick={onOpenUpdatePsw}>
              {t('account_info:change')}
            </Button>
          </Flex>
        )}
        {feConfigs?.isPlus && (
          <Flex mt={4} alignItems={'center'}>
            <Box {...labelStyles}>{t('common:contact_way')}&nbsp;</Box>
            <Box flex={1} {...(!userInfo?.contact ? { color: 'red.600' } : {})}>
              {userInfo?.contact ? userInfo?.contact : t('account_info:please_bind_contact')}
            </Box>

            <Button size={'sm'} variant={'whitePrimary'} onClick={onOpenUpdateContact}>
              {t('account_info:change')}
            </Button>
          </Flex>
        )}

        <MyDivider my={6} />

        {isPc && (
          <Flex alignItems={'center'} h={'30px'} {...titleStyles} mt={6}>
            <MyIcon mr={2} name={'support/team/group'} w={'1.25rem'} />
            {t('account_info:team_info')}
          </Flex>
        )}

        {feConfigs.isPlus && (
          <Flex mt={6} alignItems={'center'}>
            <Box {...labelStyles}>{t('account_info:user_team_team_name')}&nbsp;</Box>
            <Flex flex={'1 0 0'} w={0} align={'center'}>
              <TeamSelector height={'28px'} w={'100%'} showManage />
            </Flex>
          </Flex>
        )}

        {isPc ? (
          <Flex mt={4} alignItems={'center'} cursor={'pointer'}>
            <Box {...labelStyles}>{t('account_info:avatar')}&nbsp;</Box>

            <MyTooltip label={t('account_info:select_avatar')}>
              <Box
                w={['22px', '32px']}
                h={['22px', '32px']}
                borderRadius={'50%'}
                border={theme.borders.base}
                overflow={'hidden'}
                boxShadow={'0 0 5px rgba(0,0,0,0.1)'}
                onClick={onOpenSelectFile}
              >
                <Avatar src={userInfo?.avatar} borderRadius={'50%'} w={'100%'} h={'100%'} />
              </Box>
            </MyTooltip>
          </Flex>
        ) : (
          <Flex
            flexDirection={'column'}
            alignItems={'center'}
            cursor={'pointer'}
            onClick={onOpenSelectFile}
          >
            <MyTooltip label={t('account_info:choose_avatar')}>
              <Box
                w={['44px', '54px']}
                h={['44px', '54px']}
                borderRadius={'50%'}
                border={theme.borders.base}
                overflow={'hidden'}
                p={'2px'}
                boxShadow={'0 0 5px rgba(0,0,0,0.1)'}
                mb={2}
              >
                <Avatar src={userInfo?.avatar} borderRadius={'50%'} w={'100%'} h={'100%'} />
              </Box>
            </MyTooltip>

            <Flex alignItems={'center'} fontSize={'sm'} color={'myGray.600'}>
              <MyIcon mr={1} name={'edit'} w={'14px'} />
              {t('account_info:change')}
            </Flex>
          </Flex>
        )}
        {feConfigs?.isPlus && (
          <Flex mt={[0, 4]} alignItems={'center'}>
            <Box {...labelStyles}>{t('account_info:member_name')}&nbsp;</Box>
            <Input
              flex={'1 0 0'}
              disabled={isSyncMember}
              defaultValue={userInfo?.team?.memberName || 'Member'}
              title={t('account_info:click_modify_nickname')}
              borderColor={'transparent'}
              transform={'translateX(-11px)'}
              maxLength={100}
              onBlur={async (e) => {
                const val = e.target.value;
                if (val === userInfo?.team?.memberName) return;
                try {
                  await putUpdateMemberName(val);
                  initUserInfo();
                } catch (error) {}
              }}
            />
          </Flex>
        )}

        <MyDivider my={6} />
      </Box>
      {isOpenConversionModal && (
        <ConversionModal onClose={onCloseConversionModal} onOpenContact={onOpenContact} />
      )}
      {isOpenUpdatePsw && <UpdatePswModal onClose={onCloseUpdatePsw} />}
      {isOpenUpdateContact && <UpdateContact onClose={onCloseUpdateContact} mode="contact" />}
      <File
        onSelect={(e) =>
          onSelectImage(e, {
            maxW: 300,
            maxH: 300,
            callback: (src) => {
              if (!userInfo) return;
              onclickSave({
                ...userInfo,
                avatar: src
              });
            }
          })
        }
      />
    </Box>
  );
};

const ButtonStyles = {
  bg: 'white',
  py: 3,
  px: 6,
  border: 'sm',
  borderWidth: '1.5px',
  borderRadius: 'md',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none' as any,
  fontSize: 'sm'
};
const Other = ({ onOpenContact }: { onOpenContact: () => void }) => {
  const { feConfigs } = useSystemStore();
  const { teamPlanStatus } = useUserStore();
  const { t } = useTranslation();
  const { isPc } = useSystem();

  const { runAsync: onFeedback } = useRequest2(getWorkorderURL, {
    manual: true,
    onSuccess(data) {
      if (data) {
        window.open(data.redirectUrl);
      }
    }
  });

  return (
    <Box>
      <Grid gridGap={4}>
        {feConfigs?.docUrl && (
          <Link
            href={getDocPath('/docs/intro')}
            target="_blank"
            textDecoration={'none !important'}
            {...ButtonStyles}
          >
            <MyIcon name={'common/courseLight'} w={'18px'} color={'myGray.600'} />
            <Box ml={2} flex={1}>
              {t('account_info:help_document')}
            </Box>
          </Link>
        )}

        {!isPc &&
          feConfigs?.navbarItems
            ?.filter((item) => item.isActive)
            .map((item) => (
              <Flex key={item.id} {...ButtonStyles} onClick={() => window.open(item.url, '_blank')}>
                <Avatar src={item.avatar} w={'18px'} />
                <Box ml={2} flex={1}>
                  {item.name}
                </Box>
              </Flex>
            ))}
        {feConfigs?.concatMd && (
          <Flex onClick={onOpenContact} {...ButtonStyles}>
            <MyIcon name={'modal/concat'} w={'18px'} color={'myGray.600'} />
            <Box ml={2} flex={1}>
              {t('account_info:contact_us')}
            </Box>
          </Flex>
        )}
        {feConfigs?.show_workorder &&
          teamPlanStatus &&
          teamPlanStatus.standard?.currentSubLevel !== StandardSubLevelEnum.free && (
            <Flex onClick={onFeedback} {...ButtonStyles}>
              <MyIcon name={'feedback'} w={'18px'} color={'myGray.600'} />
              <Box ml={2} flex={1}>
                {t('common:question_feedback')}
              </Box>
            </Flex>
          )}
      </Grid>
    </Box>
  );
};
