import React, { useEffect, useImperativeHandle, useState } from "react";
import { KeyRecord } from "./type";
import { Checkbox, CheckboxOptionType, Divider, Tag } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { CheckboxValueType } from "antd/lib/checkbox/Group";

const stSelectableItem = { display: 'inline-block', width: '208px' };

interface GroupSetProps {
  title?: string;
  groupIndex: number;
  records: KeyRecord[];
  fixedShowKeys: string[];
  handleSaveChange: (index: number, checkeds: string[] | string) => void
}

interface GroupSetOptionType extends CheckboxOptionType{
  originShow: boolean;
}

const GroupSet = React.forwardRef((props: GroupSetProps, ref) => {
  const [bigOptions, setBigOptions] = useState<GroupSetOptionType[]>([]); // 所有选项
  const [indeterminate, setIndeterminate] = React.useState(true); // 是否全选
  const [totalCount, setTotalCount] = useState<number>(0);
  const [checkedList, setCheckedList] = useState<string[]>([]); // 选中的对象

  useEffect(() => {
    const options: GroupSetOptionType[] = [];
    const checkeds: string[] = [];

    // 遍历可选项
    props.records.forEach((item) => {
      options.push({
        label: item.title,
        value: item.dataIndex,
        originShow: item.originShow,
      });
      if (item.show) {
        checkeds.push(item.dataIndex);
      }
    });

    // 初始化状态
    setTotalCount(props.records.length);
    setBigOptions(options);
    setCheckedList(checkeds);
    setIndeterminate(checkeds.length !== totalCount && checkeds.length !== 0);
  }, [props.records]);

  useImperativeHandle(ref, () => {
    return {
      clearCheck: () => {
        const ckds: string[] = [];
        props.records.forEach((item) => {
          if (props.fixedShowKeys.includes(item.dataIndex as string)) {
            ckds.push(item.dataIndex);
          }
        });
        setIndeterminate(ckds.length !== 0);
        setCheckedList(ckds);
      },
      selectAll: () => {
        const ckds = props.records.map((item) => item.dataIndex)
        setCheckedList(ckds);
        setIndeterminate(false);
      },
      removeCheck: (key: string) => {
        const list = checkedList.slice();
        const index = list.indexOf(key);
        if (index !== -1) {
          list.splice(index, 1);
        }
        setCheckedList(list);
      },
      addCheck: (key: string) => {
        const ckds = bigOptions.map((item) => item.value);
        if (!ckds.includes(key)) {
          return;
        }
        const list = checkedList.slice();
        if (list.includes(key)) {
          return;
        }
        list.push(key);
        setCheckedList(list);
      },
    };
  });

  const changeAllChecked = (event: CheckboxChangeEvent) => {
    const checked = event.target.checked;
    if (checked) {
      setIndeterminate(false);
      const ckds = props.records.map((item) => item.dataIndex)
      setCheckedList(ckds);
      props.handleSaveChange(props.groupIndex, ckds);
    } else {
      const ckds: string[] = [];
      props.records.forEach((item) => {
        if (props.fixedShowKeys.includes(item.dataIndex as string)) {
          ckds.push(item.dataIndex);
        }
      });
      setIndeterminate(ckds.length !== 0);
      setCheckedList(ckds);
      props.handleSaveChange(props.groupIndex, []);
    }
  };

  // 单选操作
  const handleChange = (values: CheckboxValueType[]) => {
    let single: string = '';
    for (let i = 0; i < checkedList.length || i < values.length; i++) {
     if (values[i] !== checkedList[i]) {
       single = checkedList[i] || values[i] as string;
       break;
     }
    }
    setCheckedList(values as string[]);
    setIndeterminate(values.length !== totalCount);
    setIndeterminate(values.length !== totalCount && values.length !== 0);
    props.handleSaveChange(props.groupIndex, single as string);
  };

  const cardTitle = props.title ? (
    <span>
      <Tag color="#3c71f8">{props.title}</Tag>
      <Checkbox
        indeterminate={indeterminate}
        onChange={changeAllChecked}
        checked={checkedList.length === totalCount}
        style={{ marginLeft: '18px' }}
      >
        {checkedList.length}/{totalCount}
      </Checkbox>
    </span>
  ) : null;
  return (
    <>
      {cardTitle}
      <p/>
        <Checkbox.Group value={checkedList} onChange={handleChange}>
          {bigOptions.map((item) => {
            return (
              <span key={item.value as string} style={stSelectableItem}>
                <Checkbox disabled={props.fixedShowKeys.includes(item.value as string)} value={item.value}>{item.label}</Checkbox>
              </span>
            );
          })}
        </Checkbox.Group>
      <Divider/>
    </>
  );
});
export default React.memo(GroupSet);
