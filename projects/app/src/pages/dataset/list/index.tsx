import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  ModalBody,
  Text,
  Grid,
  VStack,
  Card
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serviceSideProps } from '@/web/common/i18n/utils';
import ParentPaths from '@/components/common/folder/Path';
import List from '@/pageComponents/dataset/list/List';
import { DatasetsContext } from './context';
import DatasetContextProvider from './context';
import { useContextSelector } from 'use-context-selector';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { AddIcon } from '@chakra-ui/icons';
import { useUserStore } from '@/web/support/user/useUserStore';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { FolderIcon } from '@fastgpt/global/common/file/image/constants';
import { EditFolderFormType } from '@fastgpt/web/components/common/MyModal/EditFolderModal';
import dynamic from 'next/dynamic';
import { postCreateDatasetFolder, resumeInheritPer } from '@/web/core/dataset/api';
import FolderSlideCard from '@/components/common/folder/SlideCard';
import { DatasetPermissionList } from '@fastgpt/global/support/permission/dataset/constant';
import {
  postUpdateDatasetCollaborators,
  deleteDatasetCollaborators,
  getCollaboratorList
} from '@/web/core/dataset/api/collaborator';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { CreateDatasetType } from '@/pageComponents/dataset/list/CreateModal';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { useToast } from '@fastgpt/web/hooks/useToast';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { PermissionValueType } from '@fastgpt/global/support/permission/type';
import MyModal from '@fastgpt/web/components/common/MyModal';

const EditFolderModal = dynamic(
  () => import('@fastgpt/web/components/common/MyModal/EditFolderModal')
);

const CreateModal = dynamic(() => import('@/pageComponents/dataset/list/CreateModal'));

const Dataset = () => {
  const { isPc } = useSystem();
  const { t } = useTranslation();
  const router = useRouter();
  const { parentId } = router.query as { parentId: string };

  const {
    myDatasets,
    paths,
    isFetchingDatasets,
    refetchPaths,
    loadMyDatasets,
    refetchFolderDetail,
    folderDetail,
    setMoveDatasetId,
    onDelDataset,
    onUpdateDataset,
    searchKey,
    setSearchKey
  } = useContextSelector(DatasetsContext, (v) => v);
  const { userInfo } = useUserStore();
  const { feConfigs } = useSystemStore();
  const { toast } = useToast();
  const [editFolderData, setEditFolderData] = useState<EditFolderFormType>();
  const [createDatasetType, setCreateDatasetType] = useState<CreateDatasetType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CreateDatasetType | null>(null);

  const onSelectDatasetType = useCallback(
    (e: CreateDatasetType) => {
      if (!feConfigs?.isPlus && [DatasetTypeEnum.websiteDataset].includes(e)) {
        return toast({
          status: 'warning',
          title: t('common:commercial_function_tip')
        });
      }
      setCreateDatasetType(e);
    },
    [t, toast, feConfigs]
  );

  const RenderSearchInput = useMemo(
    () => (
      <InputGroup maxW={['auto', '250px']}>
        <InputLeftElement h={'full'} alignItems={'center'} display={'flex'}>
          <MyIcon color={'myGray.600'} name={'common/searchLight'} w={'1rem'} />
        </InputLeftElement>
        <Input
          pl={'34px'}
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder={t('common:dataset.dataset_name')}
          py={0}
          lineHeight={'34px'}
          maxLength={30}
          bg={'white'}
        />
      </InputGroup>
    ),
    [searchKey, setSearchKey, t]
  );

  const datasetTypes = useMemo(
    () => [
      {
        type: DatasetTypeEnum.dataset,
        icon: 'core/dataset/commonDatasetColor' as const,
        iconColor: 'blue.500',
        title: t('dataset:common_dataset'),
        description: t('dataset:common_dataset_desc')
      },
      {
        type: DatasetTypeEnum.apiDataset,
        icon: 'core/dataset/externalDatasetColor' as const,
        iconColor: 'green.500',
        title: t('dataset:api_file'),
        description: t('dataset:external_file_dataset_desc')
      },
      {
        type: DatasetTypeEnum.websiteDataset,
        icon: 'core/dataset/websiteDatasetColor' as const,
        iconColor: 'purple.500',
        title: t('dataset:website_dataset'),
        description: t('dataset:website_dataset_desc')
      }
    ],
    [t]
  );

  return (
    <MyBox
      isLoading={myDatasets.length === 0 && isFetchingDatasets}
      flexDirection={'column'}
      h={'100%'}
      overflowY={'auto'}
      overflowX={'hidden'}
    >
      <Flex pt={[4, 6]} pl={3} pr={folderDetail ? [3, 6] : [3, 8]}>
        <Flex flexGrow={1} flexDirection="column">
          <Flex alignItems={'center'} justifyContent={'space-between'}>
            <ParentPaths
              paths={paths}
              FirstPathDom={
                <Flex flex={1} alignItems={'center'}>
                  <Box
                    pl={2}
                    letterSpacing={1}
                    fontSize={'1.25rem'}
                    fontWeight={'bold'}
                    color={'myGray.900'}
                  >
                    {t('common:core.dataset.My Dataset')}
                  </Box>
                </Flex>
              }
              onClick={(e) => {
                router.push({
                  query: {
                    parentId: e
                  }
                });
              }}
            />

            {isPc && RenderSearchInput}

            {(folderDetail
              ? folderDetail.permission.hasWritePer
              : userInfo?.team?.permission.hasDatasetCreatePer) && (
              <Box pl={[0, 4]}>
                <MyModal
                  isOpen={isModalOpen}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedType(null);
                  }}
                  isCentered={!isPc}
                  w={'600px'}
                  title={t('common:new_create')}
                >
                  <ModalBody p={6}>
                    <Box mb={6}>
                      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                        {datasetTypes.map((dataset) => (
                          <Card
                            key={dataset.type}
                            as="button"
                            onClick={() => setSelectedType(dataset.type as CreateDatasetType)}
                            p={6}
                            cursor="pointer"
                            _hover={{ shadow: 'md' }}
                            border="2px solid"
                            borderColor={selectedType === dataset.type ? 'myGray.500' : 'white'}
                          >
                            <VStack spacing={4} align="center">
                              <MyIcon name={dataset.icon} w="12" h="12" color={dataset.iconColor} />
                              <Text fontWeight="bold">{dataset.title}</Text>
                              <Text fontSize="xs" color="gray.500" textAlign="center">
                                {dataset.description}
                              </Text>
                            </VStack>
                          </Card>
                        ))}
                      </Grid>
                    </Box>

                    {/* 底部按钮区域 */}
                    <Flex justify="space-between" align="center" mt={6}>
                      {/* 左侧新建文件夹按钮 */}
                      <Button
                        variant="ghost"
                        leftIcon={
                          <MyIcon name="common/folderFill" w="4" h="4" color="myGray.600" />
                        }
                        onClick={() => {
                          setEditFolderData({});
                          setIsModalOpen(false);
                        }}
                      >
                        {t('common:Folder_tip')}
                      </Button>

                      {/* 右侧确认按钮 */}
                      <Button
                        variant="primary"
                        onClick={() => {
                          if (selectedType) {
                            onSelectDatasetType(selectedType as CreateDatasetType);
                            setIsModalOpen(false);
                            setSelectedType(null);
                          }
                        }}
                        isDisabled={!selectedType}
                      >
                        {t('common:Confirm_tip')}
                      </Button>
                    </Flex>
                  </ModalBody>
                </MyModal>
              </Box>
            )}
          </Flex>

          {!isPc && <Box mt={2}>{RenderSearchInput}</Box>}

          <Box flexGrow={1}>
            <List setIsModalOpen={setIsModalOpen} />
          </Box>
        </Flex>

        {!!folderDetail && isPc && (
          <Box ml="6">
            <FolderSlideCard
              resumeInheritPermission={() => resumeInheritPer(folderDetail._id)}
              isInheritPermission={folderDetail.inheritPermission}
              hasParent={!!folderDetail.parentId}
              refetchResource={() => Promise.all([refetchFolderDetail(), loadMyDatasets()])}
              refreshDeps={[folderDetail._id, folderDetail.inheritPermission]}
              name={folderDetail.name}
              intro={folderDetail.intro}
              onEdit={() => {
                setEditFolderData({
                  id: folderDetail._id,
                  name: folderDetail.name,
                  intro: folderDetail.intro
                });
              }}
              onMove={() => setMoveDatasetId(folderDetail._id)}
              deleteTip={t('common:dataset.deleteFolderTips')}
              onDelete={() =>
                onDelDataset(folderDetail._id).then(() => {
                  router.replace({
                    query: {
                      ...router.query,
                      parentId: folderDetail.parentId
                    }
                  });
                })
              }
              managePer={{
                permission: folderDetail.permission,
                onGetCollaboratorList: () => getCollaboratorList(folderDetail._id),
                permissionList: DatasetPermissionList,
                onUpdateCollaborators: ({
                  members,
                  groups,
                  permission
                }: {
                  members?: string[];
                  groups?: string[];
                  permission: PermissionValueType;
                }) =>
                  postUpdateDatasetCollaborators({
                    members,
                    groups,
                    permission,
                    datasetId: folderDetail._id
                  }),
                onDelOneCollaborator: async ({ tmbId, groupId, orgId }) => {
                  if (tmbId) {
                    return deleteDatasetCollaborators({
                      datasetId: folderDetail._id,
                      tmbId
                    });
                  } else if (groupId) {
                    return deleteDatasetCollaborators({
                      datasetId: folderDetail._id,
                      groupId
                    });
                  } else if (orgId) {
                    return deleteDatasetCollaborators({
                      datasetId: folderDetail._id,
                      orgId
                    });
                  }
                },
                refreshDeps: [folderDetail._id, folderDetail.inheritPermission]
              }}
            />
          </Box>
        )}
      </Flex>

      {!!editFolderData && (
        <EditFolderModal
          {...editFolderData}
          onClose={() => setEditFolderData(undefined)}
          onCreate={async ({ name, intro }) => {
            try {
              await postCreateDatasetFolder({
                parentId: parentId || undefined,
                name,
                intro: intro ?? ''
              });
              loadMyDatasets();
              refetchPaths();
            } catch (error) {
              return Promise.reject(error);
            }
          }}
          onEdit={async ({ name, intro, id }) => {
            try {
              await onUpdateDataset({
                id,
                name,
                intro
              });
            } catch (error) {
              return Promise.reject(error);
            }
          }}
        />
      )}
      {createDatasetType && (
        <CreateModal
          type={createDatasetType}
          onClose={() => setCreateDatasetType(undefined)}
          parentId={parentId || undefined}
        />
      )}
    </MyBox>
  );
};
export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['dataset', 'user']))
    }
  };
}

function DatasetContextWrapper() {
  return (
    <DatasetContextProvider>
      <Dataset />
    </DatasetContextProvider>
  );
}

export default DatasetContextWrapper;
