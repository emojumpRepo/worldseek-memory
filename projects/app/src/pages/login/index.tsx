import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useDisclosure
} from '@chakra-ui/react';
import { LoginPageTypeEnum } from '@/web/support/user/login/constants';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import type { ResLogin } from '@/global/support/api/userRes.d';
import { useRouter } from 'next/router';
import { useUserStore } from '@/web/support/user/useUserStore';
import dynamic from 'next/dynamic';
import { serviceSideProps } from '@/web/common/i18n/utils';
import { clearToken } from '@/web/support/user/auth';
import Script from 'next/script';
import Loading from '@fastgpt/web/components/common/MyLoading';
import { useLocalStorageState, useMount } from 'ahooks';
import { useTranslation } from 'next-i18next';
import I18nLngSelector from '@/components/Select/I18nLngSelector';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { GET } from '@/web/common/api/request';
import { getDocPath } from '@/web/common/system/doc';
import { getWebReqUrl } from '@fastgpt/web/common/system/utils';
import LoginForm from '@/pageComponents/login/LoginForm/LoginForm';
import { useToast } from '@fastgpt/web/hooks/useToast';

const RegisterForm = dynamic(() => import('@/pageComponents/login/RegisterForm'));
const ForgetPasswordForm = dynamic(() => import('@/pageComponents/login/ForgetPasswordForm'));
const WechatForm = dynamic(() => import('@/pageComponents/login/LoginForm/WechatForm'));
const CommunityModal = dynamic(() => import('@/components/CommunityModal'));

const ipDetectURL = 'https://qifu-api.baidubce.com/ip/local/geo/v1/district';

const Login = ({ ChineseRedirectUrl }: { ChineseRedirectUrl: string }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { lastRoute = '' } = router.query as { lastRoute: string };
  const { feConfigs } = useSystemStore();
  const [pageType, setPageType] = useState<`${LoginPageTypeEnum}`>(LoginPageTypeEnum.passwordLogin);
  const { setUserInfo } = useUserStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isPc } = useSystem();
  const { toast } = useToast();

  const {
    isOpen: isOpenCookiesDrawer,
    onOpen: onOpenCookiesDrawer,
    onClose: onCloseCookiesDrawer
  } = useDisclosure();
  const cookieVersion = '1';
  const [localCookieVersion, setLocalCookieVersion] =
    useLocalStorageState<string>('localCookieVersion');

  const loginSuccess = useCallback(
    (res: ResLogin) => {
      setUserInfo(res.user);

      const decodeLastRoute = decodeURIComponent(lastRoute);
      // 检查是否是当前的 route
      const navigateTo =
        decodeLastRoute && !decodeLastRoute.includes('/login') ? decodeLastRoute : '/dataset/list';
      router.push(navigateTo);
    },
    [setUserInfo, lastRoute, router]
  );

  const DynamicComponent = useMemo(() => {
    const TypeMap = {
      [LoginPageTypeEnum.passwordLogin]: LoginForm,
      [LoginPageTypeEnum.register]: RegisterForm,
      [LoginPageTypeEnum.forgetPassword]: ForgetPasswordForm,
      [LoginPageTypeEnum.wechat]: WechatForm
    };

    // @ts-ignore
    const Component = TypeMap[pageType];

    return <Component setPageType={setPageType} loginSuccess={loginSuccess} />;
  }, [pageType, loginSuccess]);

  /* default login type */
  useEffect(() => {
    const bd_vid = sessionStorage.getItem('bd_vid');
    if (bd_vid) {
      setPageType(LoginPageTypeEnum.passwordLogin);
      return;
    }
    setPageType(
      feConfigs?.oauth?.wechat ? LoginPageTypeEnum.wechat : LoginPageTypeEnum.passwordLogin
    );
  }, [feConfigs?.oauth?.wechat]);

  const {
    isOpen: isOpenRedirect,
    onOpen: onOpenRedirect,
    onClose: onCloseRedirect
  } = useDisclosure();
  const [showRedirect, setShowRedirect] = useLocalStorageState<boolean>('showRedirect', {
    defaultValue: true
  });
  const checkIpInChina = useCallback(async () => {
    try {
      const res = await GET<any>(ipDetectURL);
      const country = res?.country;
      if (
        country &&
        country === '中国' &&
        res.prov !== '中国香港' &&
        res.prov !== '中国澳门' &&
        res.prov !== '中国台湾'
      ) {
        onOpenRedirect();
      }
    } catch (error) {
      console.log(error);
    }
  }, [onOpenRedirect]);

  useMount(() => {
    clearToken();
    router.prefetch('/dataset/list');

    ChineseRedirectUrl && showRedirect && checkIpInChina();
    localCookieVersion !== cookieVersion && onOpenCookiesDrawer();
  });

  return (
    <>
      <Flex
        alignItems={'center'}
        justifyContent={'center'}
        // bg={`url(${getWebReqUrl('/icon/login-bg.svg')}) no-repeat`}
        background="radial-gradient(66.06% 66.06% at 0 0, rgba(52, 120, 255, 0.13) 0, rgba(52, 120, 255, 0) 100%),
            radial-gradient(46.32% 67.56% at 52.35% -1%, rgba(52, 180, 255, 0.16) 0, rgba(52, 180, 255, 0) 100%),
            radial-gradient(59.31% 62.11% at 92.4% 0, rgba(122, 200, 255, 0.12) 0, rgba(122, 200, 255, 0) 100%)"
        backgroundSize={'cover'}
        userSelect={'none'}
        h={'100%'}
      >
        <Flex
          flexDirection={'column'}
          w={['100%', '556px']}
          h={['100%', '677px']}
          bg={'white'}
          px={['5vw', '88px']}
          py={['5vh', '64px']}
          borderRadius={[0, '16px']}
          boxShadow={[
            '',
            '0px 32px 64px -12px rgba(19, 51, 107, 0.20), 0px 0px 1px 0px rgba(19, 51, 107, 0.20)'
          ]}
        >
          <Box w={['100%', '380px']} flex={'1 0 0'}>
            {pageType ? (
              DynamicComponent
            ) : (
              <Center w={'full'} h={'full'} position={'relative'}>
                <Loading fixed={false} />
              </Center>
            )}
          </Box>
        </Flex>

        {/* {isOpen && <CommunityModal onClose={onClose} />} */}
      </Flex>
    </>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: {
      ChineseRedirectUrl: process.env.CHINESE_IP_REDIRECT_URL ?? '',
      ...(await serviceSideProps(context, ['app', 'user', 'login']))
    }
  };
}

export default Login;
