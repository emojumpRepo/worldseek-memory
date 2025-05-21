import React, { useMemo } from 'react';
import { Box, Flex, MenuButton, Button, Link, useDisclosure, HStack } from '@chakra-ui/react';
import {
  getDatasetCollectionPathById,
  postDatasetCollection,
  putDatasetCollectionById
} from '@/web/core/dataset/api';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyInput from '@/components/MyInput';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useRouter } from 'next/router';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { useEditTitle } from '@/web/common/hooks/useEditTitle';
import {
  DatasetCollectionTypeEnum,
  DatasetTypeEnum,
  DatasetTypeMap,
  DatasetStatusEnum
} from '@fastgpt/global/core/dataset/constants';
import EditFolderModal, { useEditFolder } from '../../EditFolderModal';
import { TabEnum } from '../../../../pages/dataset/detail/index';
import ParentPath from '@/components/common/ParentPaths';
import dynamic from 'next/dynamic';

import { ImportDataSourceEnum } from '@fastgpt/global/core/dataset/constants';
import { useContextSelector } from 'use-context-selector';
import { CollectionPageContext } from './Context';
import { DatasetPageContext } from '@/web/core/dataset/context/datasetPageContext';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import HeaderTagPopOver from './HeaderTagPopOver';
import MyBox from '@fastgpt/web/components/common/MyBox';
import Icon from '@fastgpt/web/components/common/Icon';
import MyTag from '@fastgpt/web/components/common/Tag/index';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import { Progress } from '@chakra-ui/react';
import MyPopover from '@fastgpt/web/components/common/MyPopover';
import { getTrainingQueueLen } from '@/web/core/dataset/api';

const FileSourceSelector = dynamic(() => import('../Import/components/FileSourceSelector'));

const Header = ({ hasTrainingData }: { hasTrainingData: boolean }) => {
  const { t } = useTranslation();
  const { feConfigs } = useSystemStore();
  const { isPc } = useSystem();

  const datasetDetail = useContextSelector(DatasetPageContext, (v) => v.datasetDetail);

  const router = useRouter();
  const { parentId = '' } = router.query as { parentId: string };

  const {
    searchText,
    setSearchText,
    total,
    getData,
    pageNum,
    onOpenWebsiteModal,
    openWebSyncConfirm
  } = useContextSelector(CollectionPageContext, (v) => v);

  const { rebuildingCount } = useContextSelector(DatasetPageContext, (v) => v);

  const { data: paths = [] } = useRequest2(() => getDatasetCollectionPathById(parentId), {
    refreshDeps: [parentId],
    manual: false
  });

  const { editFolderData, setEditFolderData } = useEditFolder();
  const { onOpenModal: onOpenCreateVirtualFileModal, EditModal: EditCreateVirtualFileModal } =
    useEditTitle({
      title: t('common:dataset.Create manual collection'),
      tip: t('common:dataset.Manual collection Tip'),
      canEmpty: false
    });

  // Import collection
  const {
    isOpen: isOpenFileSourceSelector,
    onOpen: onOpenFileSourceSelector,
    onClose: onCloseFileSourceSelector
  } = useDisclosure();

  const { runAsync: onCreateCollection } = useRequest2(
    async ({ name, type }: { name: string; type: DatasetCollectionTypeEnum }) => {
      const id = await postDatasetCollection({
        parentId,
        datasetId: datasetDetail._id,
        name,
        type
      });
      return id;
    },
    {
      onSuccess() {
        getData(pageNum);
      },
      successToast: t('common:common.Create Success'),
      errorToast: t('common:common.Create Failed')
    }
  );

  const isWebSite = datasetDetail?.type === DatasetTypeEnum.websiteDataset;

  // global queue
  const {
    data: {
      vectorTrainingCount = 0,
      qaTrainingCount = 0,
      autoTrainingCount = 0,
      imageTrainingCount = 0
    } = {}
  } = useRequest2(getTrainingQueueLen, {
    manual: false,
    retryInterval: 10000
  });

  const { vectorTrainingMap, qaTrainingMap, autoTrainingMap, imageTrainingMap } = useMemo(() => {
    const vectorTrainingMap = (() => {
      if (vectorTrainingCount < 1000)
        return {
          colorSchema: 'green',
          tip: t('common:core.dataset.training.Leisure')
        };
      if (vectorTrainingCount < 20000)
        return {
          colorSchema: 'yellow',
          tip: t('common:core.dataset.training.Waiting')
        };
      return {
        colorSchema: 'red',
        tip: t('common:core.dataset.training.Full')
      };
    })();

    const countLLMMap = (count: number) => {
      if (count < 100)
        return {
          colorSchema: 'green',
          tip: t('common:core.dataset.training.Leisure')
        };
      if (count < 1000)
        return {
          colorSchema: 'yellow',
          tip: t('common:core.dataset.training.Waiting')
        };
      return {
        colorSchema: 'red',
        tip: t('common:core.dataset.training.Full')
      };
    };
    const qaTrainingMap = countLLMMap(qaTrainingCount);
    const autoTrainingMap = countLLMMap(autoTrainingCount);
    const imageTrainingMap = countLLMMap(imageTrainingCount);

    return {
      vectorTrainingMap,
      qaTrainingMap,
      autoTrainingMap,
      imageTrainingMap
    };
  }, [qaTrainingCount, autoTrainingCount, imageTrainingCount, vectorTrainingCount, t]);

  return (
    <MyBox display={['block', 'flex']} alignItems={'center'} gap={2}>
      <HStack flex={1} gap={2} alignItems="center" wrap="nowrap">
        <Box fontWeight={'500'} color={'myGray.900'} whiteSpace={'nowrap'}>
          <ParentPath
            paths={paths.map((path, i) => ({
              parentId: path.parentId,
              parentName: i === paths.length - 1 ? `${path.parentName}` : path.parentName
            }))}
            FirstPathDom={
              <Flex
                flexDir={'column'}
                justify={'center'}
                h={'100%'}
                fontSize={isWebSite ? 'sm' : 'md'}
                fontWeight={'500'}
                color={'myGray.600'}
              >
                <Flex align={'center'}>
                  {!isWebSite && <MyIcon name="common/list" mr={2} w={'20px'} color={'black'} />}
                  {t(DatasetTypeMap[datasetDetail?.type]?.collectionLabel as any)}({total})
                </Flex>
                {/* Website sync */}
                {datasetDetail?.websiteConfig?.url && (
                  <Flex fontSize={'mini'}>
                    <Box>{t('common:core.dataset.website.Base Url')}:</Box>
                    <Link
                      className="textEllipsis"
                      maxW={'300px'}
                      href={datasetDetail.websiteConfig.url}
                      target="_blank"
                      color={'blue.700'}
                    >
                      {datasetDetail.websiteConfig.url}
                    </Link>
                  </Flex>
                )}
              </Flex>
            }
            onClick={(e) => {
              router.replace({
                query: {
                  ...router.query,
                  parentId: e
                }
              });
            }}
          />
        </Box>

        {/* Tag */}
        {datasetDetail.type !== DatasetTypeEnum.websiteDataset &&
          datasetDetail.permission.hasWritePer &&
          feConfigs?.isPlus && <HeaderTagPopOver />}

        {/* search input - 移动到这里，放在同一行 */}
        {isPc && (
          <Box ml={3}>
            <MyInput
              ml={0}
              w={'200px'}
              size={'sm'}
              h={'30px'}
              placeholder={t('common:common.Search') || ''}
              value={searchText}
              leftIcon={
                <MyIcon
                  name="common/searchLight"
                  position={'absolute'}
                  w={'16px'}
                  color={'myGray.500'}
                />
              }
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
          </Box>
        )}
      </HStack>

      {/* diff collection button */}
      {datasetDetail.permission.hasWritePer && (
        <Box mt={[3, 0]}>
          <HStack spacing={2}>
            {/* 训练情况hover弹窗 - 从NavBar.tsx移动过来 */}
            <MyPopover
              placement="bottom-end"
              trigger="hover"
              Trigger={
                <Flex
                  alignItems={'center'}
                  justifyContent={'center'}
                  py={2}
                  px={4}
                  borderRadius={'md'}
                  bg={'myGray.100'}
                  _hover={{
                    bg: 'myGray.200'
                  }}
                  cursor={'pointer'}
                >
                  <MyIcon name={'common/monitor'} w={'16px'} h={'16px'} color={'myGray.500'} />
                  <Box
                    color="myGray.900"
                    ml={1.5}
                    fontSize={'sm'}
                    fontWeight={500}
                    userSelect={'none'}
                  >
                    {t('common:core.dataset.training.tag')}
                  </Box>
                </Flex>
              }
            >
              {({ onClose }) => (
                <Box p={6}>
                  {rebuildingCount > 0 && (
                    <Box mb={3}>
                      <Box fontSize={'sm'}>
                        {t('dataset:rebuilding_index_count', { count: rebuildingCount })}
                      </Box>
                    </Box>
                  )}
                  <Box mb={3}>
                    <Box fontSize={'sm'} pb={1}>
                      {t('common:core.dataset.training.Agent queue')}({qaTrainingMap.tip})
                    </Box>
                    <Progress
                      value={100}
                      size={'xs'}
                      colorScheme={qaTrainingMap.colorSchema}
                      borderRadius={'md'}
                      isAnimated
                      hasStripe
                    />
                  </Box>
                  <Box mb={3}>
                    <Box fontSize={'sm'} pb={1}>
                      {t('dataset:auto_training_queue')}({autoTrainingMap.tip})
                    </Box>
                    <Progress
                      value={100}
                      size={'xs'}
                      colorScheme={autoTrainingMap.colorSchema}
                      borderRadius={'md'}
                      isAnimated
                      hasStripe
                    />
                  </Box>
                  <Box mb={3}>
                    <Box fontSize={'sm'} pb={1}>
                      {t('dataset:image_training_queue')}({imageTrainingMap.tip})
                    </Box>
                    <Progress
                      value={100}
                      size={'xs'}
                      colorScheme={imageTrainingMap.colorSchema}
                      borderRadius={'md'}
                      isAnimated
                      hasStripe
                    />
                  </Box>
                  <Box>
                    <Box fontSize={'sm'} pb={1}>
                      {t('common:core.dataset.training.Vector queue')}({vectorTrainingMap.tip})
                    </Box>
                    <Progress
                      value={100}
                      size={'xs'}
                      colorScheme={vectorTrainingMap.colorSchema}
                      borderRadius={'md'}
                      isAnimated
                      hasStripe
                    />
                  </Box>
                </Box>
              )}
            </MyPopover>

            {datasetDetail?.type === DatasetTypeEnum.dataset && (
              <MyMenu
                offset={[0, 5]}
                Button={
                  <MenuButton
                    _hover={{
                      color: 'primary.900'
                    }}
                    fontSize={['sm', 'md']}
                  >
                    <Flex
                      px={3.5}
                      py={2}
                      borderRadius={'sm'}
                      cursor={'pointer'}
                      bg={'primary.900'}
                      overflow={'hidden'}
                      color={'white'}
                    >
                      <Flex h={'20px'} alignItems={'center'}>
                        <MyIcon
                          name={'common/folderImport'}
                          mr={2}
                          w={'18px'}
                          h={'18px'}
                          color={'white'}
                        />
                      </Flex>
                      <Box h={'20px'} fontSize={'sm'} fontWeight={'500'}>
                        {t('common:dataset.collections.Create And Import')}
                      </Box>
                    </Flex>
                  </MenuButton>
                }
                menuList={[
                  {
                    children: [
                      {
                        label: (
                          <Flex>
                            <MyIcon name={'common/folderFill'} w={'20px'} mr={2} />
                            {t('common:Folder')}
                          </Flex>
                        ),
                        onClick: () => setEditFolderData({})
                      },
                      {
                        label: (
                          <Flex>
                            <MyIcon name={'core/dataset/manualCollection'} mr={2} w={'20px'} />
                            {t('common:core.dataset.Manual collection')}
                          </Flex>
                        ),
                        onClick: () => {
                          onOpenCreateVirtualFileModal({
                            defaultVal: '',
                            onSuccess: (name) =>
                              onCreateCollection({ name, type: DatasetCollectionTypeEnum.virtual })
                          });
                        }
                      },
                      {
                        label: (
                          <Flex>
                            <MyIcon name={'core/dataset/fileCollection'} mr={2} w={'20px'} />
                            {t('common:core.dataset.Text collection')}
                          </Flex>
                        ),
                        onClick: onOpenFileSourceSelector
                      },
                      {
                        label: (
                          <Flex>
                            <MyIcon name={'core/dataset/tableCollection'} mr={2} w={'20px'} />
                            {t('common:core.dataset.Table collection')}
                          </Flex>
                        ),
                        onClick: () =>
                          router.replace({
                            query: {
                              ...router.query,
                              currentTab: TabEnum.import,
                              source: ImportDataSourceEnum.csvTable
                            }
                          })
                      }
                    ]
                  }
                ]}
              />
            )}
          </HStack>

          {datasetDetail?.type === DatasetTypeEnum.websiteDataset && (
            <>
              {datasetDetail?.websiteConfig?.url ? (
                <>
                  {datasetDetail.status === DatasetStatusEnum.active && (
                    <HStack gap={2}>
                      <Button
                        onClick={onOpenWebsiteModal}
                        leftIcon={<Icon name="change" w={'1rem'} />}
                      >
                        {t('dataset:params_config')}
                      </Button>
                      {!hasTrainingData && (
                        <Button
                          variant={'whitePrimary'}
                          onClick={openWebSyncConfirm}
                          leftIcon={<Icon name="common/confirm/restoreTip" w={'1rem'} />}
                        >
                          {t('dataset:immediate_sync')}
                        </Button>
                      )}
                    </HStack>
                  )}
                  {datasetDetail.status === DatasetStatusEnum.syncing && (
                    <MyTag
                      colorSchema="purple"
                      showDot
                      px={3}
                      h={'36px'}
                      DotStyles={{
                        w: '8px',
                        h: '8px',
                        animation: 'zoomStopIcon 0.5s infinite alternate'
                      }}
                    >
                      {t('common:core.dataset.status.syncing')}
                    </MyTag>
                  )}
                  {datasetDetail.status === DatasetStatusEnum.waiting && (
                    <MyTag
                      colorSchema="gray"
                      showDot
                      px={3}
                      h={'36px'}
                      DotStyles={{
                        w: '8px',
                        h: '8px',
                        animation: 'zoomStopIcon 0.5s infinite alternate'
                      }}
                    >
                      {t('common:core.dataset.status.waiting')}
                    </MyTag>
                  )}
                  {datasetDetail.status === DatasetStatusEnum.error && (
                    <MyTag colorSchema="red" showDot px={3} h={'36px'}>
                      <HStack spacing={1}>
                        <Box>{t('dataset:status_error')}</Box>
                        <QuestionTip color={'red.500'} label={datasetDetail.errorMsg} />
                      </HStack>
                    </MyTag>
                  )}
                </>
              ) : (
                <Button
                  onClick={onOpenWebsiteModal}
                  leftIcon={<Icon name="common/setting" w={'18px'} />}
                >
                  {t('common:core.dataset.Set Website Config')}
                </Button>
              )}
            </>
          )}
          {datasetDetail?.type === DatasetTypeEnum.externalFile && (
            <MyMenu
              offset={[0, 5]}
              Button={
                <MenuButton
                  _hover={{
                    color: 'primary.500'
                  }}
                  fontSize={['sm', 'md']}
                >
                  <Flex
                    px={3.5}
                    py={2}
                    borderRadius={'sm'}
                    cursor={'pointer'}
                    bg={'primary.500'}
                    overflow={'hidden'}
                    color={'white'}
                  >
                    <Flex h={'20px'} alignItems={'center'}>
                      <MyIcon
                        name={'common/folderImport'}
                        mr={2}
                        w={'18px'}
                        h={'18px'}
                        color={'white'}
                      />
                    </Flex>
                    <Box h={'20px'} fontSize={'sm'} fontWeight={'500'}>
                      {t('common:dataset.collections.Create And Import')}
                    </Box>
                  </Flex>
                </MenuButton>
              }
              menuList={[
                {
                  children: [
                    {
                      label: (
                        <Flex>
                          <MyIcon name={'common/folderFill'} w={'20px'} mr={2} />
                          {t('common:Folder')}
                        </Flex>
                      ),
                      onClick: () => setEditFolderData({})
                    },
                    {
                      label: (
                        <Flex>
                          <MyIcon name={'core/dataset/fileCollection'} mr={2} w={'20px'} />
                          {t('common:core.dataset.Text collection')}
                        </Flex>
                      ),
                      onClick: () =>
                        router.replace({
                          query: {
                            ...router.query,
                            currentTab: TabEnum.import,
                            source: ImportDataSourceEnum.externalFile
                          }
                        })
                    }
                  ]
                }
              ]}
            />
          )}
          {/* apiDataset */}
          {(datasetDetail?.type === DatasetTypeEnum.apiDataset ||
            datasetDetail?.type === DatasetTypeEnum.feishu ||
            datasetDetail?.type === DatasetTypeEnum.yuque) && (
            <Flex
              px={3.5}
              py={2}
              borderRadius={'sm'}
              cursor={'pointer'}
              bg={'primary.900'}
              overflow={'hidden'}
              color={'white'}
              onClick={() =>
                router.replace({
                  query: {
                    ...router.query,
                    currentTab: TabEnum.import,
                    source: ImportDataSourceEnum.apiDataset
                  }
                })
              }
            >
              <Flex h={'20px'} alignItems={'center'}>
                <MyIcon name={'common/folderImport'} mr={2} w={'18px'} h={'18px'} color={'white'} />
              </Flex>
              <Box h={'20px'} fontSize={'sm'} fontWeight={'500'}>
                {t('dataset:add_file')}
              </Box>
            </Flex>
          )}
        </Box>
      )}

      {/* modal */}
      {!!editFolderData && (
        <EditFolderModal
          onClose={() => setEditFolderData(undefined)}
          editCallback={async (name) => {
            try {
              if (editFolderData.id) {
                await putDatasetCollectionById({
                  id: editFolderData.id,
                  name
                });
                getData(pageNum);
              } else {
                onCreateCollection({
                  name,
                  type: DatasetCollectionTypeEnum.folder
                });
              }
            } catch (error) {
              return Promise.reject(error);
            }
          }}
          isEdit={!!editFolderData.id}
          name={editFolderData.name}
        />
      )}
      <EditCreateVirtualFileModal iconSrc={'modal/manualDataset'} closeBtnText={''} />
      {isOpenFileSourceSelector && <FileSourceSelector onClose={onCloseFileSourceSelector} />}
    </MyBox>
  );
};

export default Header;
