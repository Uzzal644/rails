import type {InputRef} from 'antd';
import {
  Button,
  Layout,
  Drawer,
  theme,
  Select,
  Typography,
  Input,
  DatePicker,
  Checkbox,
  Tag,
} from 'antd';

import type {Issue, User} from '@prisma/client';
import CommentSection from '../Comment/Comment';
import {api} from '../../utils/api';
import Checklist from '../Checklist/Checklist';
import {useProjectStore} from '../../store/project.store';
import {useState} from 'react';
import LabelSelect from '../Label/LabelDropdown/LabelSelect';
import dayjs from 'dayjs';

import React from 'react';
import ButtonMenu from '../ButtonMenu/ButtonMenu';

import {
  CheckSquareOutlined,
  CheckCircleOutlined,
  LinkOutlined,
  ApartmentOutlined,
  FlagOutlined,
} from '@ant-design/icons';
interface DetailsModalProps {
  open: boolean;
  title: string;
  item: Issue;
  onCancel: () => void;
}

const {Sider, Content} = Layout;
const {Title, Paragraph, Text} = Typography;
const {TextArea} = Input;

const ItemDetailsModal: React.FC<DetailsModalProps> = (
  props: DetailsModalProps
) => {
  const {
    token: {colorBgElevated},
  } = theme.useToken();

  const {mutate: createCheckList, isLoading: isCreatingChecklist} =
    api.issue.createChecklist.useMutation({
      onSuccess: () => {
        checkListQuery.refetch();
      },
    });

  const checkListQuery = api.issue.getChecklistsInIssue.useQuery({
    issueId: props.item.id,
  });

  const getUserOptions = (users: User[]) => {
    const options = users.map((member) => {
      return {
        value: member.id,
        label: member.name,
      };
    });
    return options;
  };
  const projectMembers = useProjectStore((state) => state.project?.members);
  const userOptions = getUserOptions(projectMembers ?? []);

  const {mutate: updateIssueTitle} = api.issue.updateIssueTitle.useMutation();
  const {mutate: updateDescription} =
    api.issue.updateIssueDescription.useMutation();

  const [issueTitle, setIssueTitle] = useState(props.item.title);
  const [issueDescription, setIssueDescription] = useState(
    props.item.description
  );

  const [selectedDueDate, setSelectedDueDate] = useState(
    props.item.dueDate ? dayjs(props.item.dueDate) : null
  );

  const inputRef = React.useRef<InputRef>(null);

  const [checkListTitle, setCheckListTitle] = useState('');

  const [checkListOpen, setChecklistOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const {mutate: setDueDate, isLoading: isSettingDueDate} =
    api.issue.setDueDate.useMutation({
      onSuccess: () => {
        setIsDatePickerOpen(false);
      },
    });

  const {mutate: removeDueDate} = api.issue.removeDueDate.useMutation({
    onSuccess: () => {
      setSelectedDueDate(null);
      setIsDatePickerOpen(false);
    },
  });

  const handleCheckListAdd = () => {
    if (checkListTitle.length > 0) {
      createCheckList({
        issueId: props.item.id,
        title: checkListTitle,
      });
      setChecklistOpen(false);
      setCheckListTitle('CheckList');
    } else {
      inputRef.current?.focus();
    }
  };

  //TODO: HANDLE DUE DATE CHECKBOX INTEGRATION
  const [isDueDateChecked, setIsDueDateChecked] = useState(false);

  //TODO:&& HANDLE OVERDUE STATE ON UI

  //handling adding and removing flag

  const {mutate: addFlag, isLoading: addingFlag} =
    api.issue.addFlag.useMutation();

  const {mutate: removeFlag, isLoading: removingFlag} =
    api.issue.addFlag.useMutation();

  return (
    <>
      <Drawer
        placement="right"
        title={
          <Paragraph
            editable={{
              onChange: (val) => {
                setIssueTitle(val);
                updateIssueTitle({issueId: props.item.id, title: issueTitle});
              },
              triggerType: ['text'],
            }}
            className="m-0"
          >
            {issueTitle}
          </Paragraph>
        }
        width={800}
        open={props.open}
        onClose={props.onCancel}
        bodyStyle={{paddingTop: 8}}
      >
        <Layout
          className="gap-1"
          hasSider
          style={{backgroundColor: colorBgElevated}}
        >
          <Content style={{backgroundColor: colorBgElevated}}>
             {props.item.flagged ? (
             <Tag icon={<FlagOutlined />} color="warning">
                  Flagged
                </Tag>
               ) : (
                <></>
              )} 
            <div className="flex flex-col gap-1-2">
              <div>
                <Text>Labels</Text>
                <LabelSelect/>
              </div>
              {props.item.dueDate ? (
                <div>
                  <Text strong>Due Date</Text>
                  <div className="flex gap-1-2">
                    <Checkbox
                      value={isDueDateChecked}
                      onChange={(e) => {
                        setIsDueDateChecked(e.target.checked);
                      }}
                    />
                    <Button onClick={() => setIsDatePickerOpen(true)}>
                      {dayjs(props.item.dueDate).format('MMM DD')} at{' '}
                      {dayjs(props.item.dueDate).format('hh:mm A')}
                      {isDueDateChecked ? (
                        <Tag
                          icon={<CheckCircleOutlined />}
                          color={'success'}
                          className="ml-2"
                        >
                          Complete
                        </Tag>
                      ) : (
                        <></>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <></>
              )}
              <Text strong>Description</Text>
              <TextArea
                rows={4}
                placeholder="Add a more detailed description..."
                defaultValue={issueDescription ?? ''}
                onChange={(e) => {
                  setIssueDescription(e.target.value);
                }}
                onBlur={() => {
                  updateDescription({
                    issueId: props.item.id,
                    description: issueDescription,
                  });
                }}
              />
              {checkListQuery.data?.map((checklist, idx) => {
                return <Checklist key={idx} {...checklist} />;
              })}
              <Text strong>Activity</Text>
              <CommentSection
                issueId={props.item.id}
                members={projectMembers}
                isLoadingMembers={false}
              />
            </div>
          </Content>
          <Sider style={{backgroundColor: colorBgElevated}}>
            <div className="flex flex-col gap-1-2">
              <Title level={5}>Details</Title>
              <div className="flex flex-wrap items-center  justify-between">
                <Text>Assignee</Text>
                <Select
                  bordered={false}
                  defaultActiveFirstOption={true}
                  defaultValue={userOptions[0]}
                  showSearch
                  placeholder="Unassignee"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={[
                    {
                      value: undefined,
                      label: 'Unassigned',
                    },
                    ...userOptions,
                  ]}
                />
              </div>
              <Text strong>Actions</Text>
              <DatePicker
                format={'MMM DD, YYYY hh:mm A'}
                open={isDatePickerOpen}
                placeholder="Dates"
                value={selectedDueDate}
                onChange={(date) => {
                  setSelectedDueDate(date);
                }}
                onOpenChange={(open) => {
                  setIsDatePickerOpen(open);
                }}
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: dayjs('00:00:00', 'HH:mm'),
                }}
                onOk={(date) => {
                  setDueDate({
                    issueId: props.item.id,
                    dueDate: date.toDate(),
                  });
                }}
                renderExtraFooter={() => {
                  if (props.item.dueDate)
                    return (
                      <div className="flex flex-end p-2 w-full">
                        <Button
                          type="default"
                          onClick={() => {
                            removeDueDate({
                              issueId: props.item.id,
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                }}
              />
              <ButtonMenu
                open={checkListOpen}
                title="Add Checklist"
                renderer={
                  <Button icon={<CheckSquareOutlined />}>Checklist</Button>
                }
                onOpenChange={(open) => {
                  setChecklistOpen(open);
                  if (open) {
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 100);
                  }
                }}
              >
                <Text>Title</Text>
                <Input
                  placeholder="Title"
                  defaultValue="Checklist"
                  className="mb-2 mt-1"
                  autoFocus={true}
                  ref={inputRef}
                  value={checkListTitle}
                  onChange={(e) => {
                    setCheckListTitle(e.target.value);
                  }}
                />
                <Button
                  type="primary"
                  onClick={() => handleCheckListAdd()}
                  loading={isCreatingChecklist}
                >
                  Add
                </Button>
              </ButtonMenu>
              <Button type="default" icon={<LinkOutlined />} onClick={() => {}}>
                Attach
              </Button>
              <Button
                type="default"
                icon={<ApartmentOutlined />}
                onClick={() => {}}
              >
                Link Child Issue
              </Button>
              <Button
                type="default"
                icon={<FlagOutlined />}
                onClick={() => {
                  if (props.item.flagged) {
                    removeFlag({
                      issueId: props.item.id,
                    });
                  } else {
                    addFlag({
                      issueId: props.item.id,
                    });
                  }
                }}
                loading={addingFlag || removingFlag}
              >
                {props.item.flagged ? 'Remove Flag' : 'Add Flag'}
              </Button>
            </div>
          </Sider>
        </Layout>
      </Drawer>
    </>
  );
};

export default ItemDetailsModal;
