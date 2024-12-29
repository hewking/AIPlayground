import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import Modal from "react-native-modal";
import IconFont from "@nirvana/ui-icon";
import { Divider } from "@nirvana/ui-divider";
import { BaseButton } from "@nirvana/ui-buttons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckBox } from "@nirvana/element";

export type BrandItem = {
  title: string;
  checked: boolean;
  key: string;
};

type ChooseBrandProps = {
  visible: boolean;
  title: string;
  items: BrandItem[];
  materialName?: string;
  select: (key: string, checked: boolean) => void;
  onRequestClose?: () => void;
  onComfirm?: (selected: BrandItem[]) => void;
};

type ShowBrandProps = Pick<ChooseBrandProps, "materialName" | "onComfirm">;

function ChooseBrandModal({
  visible,
  title,
  items,
  materialName,
  onRequestClose,
  select,
  onComfirm,
}: ChooseBrandProps) {
  const { bottom } = useSafeAreaInsets();

  const haveChecked = items.some((item) => item.checked);

  const renderButton = () => {
    const buttonActions = [
      {
        text: "取消",
        onPress: () => {
          console.log('close modal');
          onRequestClose?.();
        },
        style: {
          borderWidth: 1,
          borderRadius: 4,
          flex: 1,
          paddingHorizontal: 12,
          paddingVertical: 8,
        },
        textStyle: {
          fontSize: 14,
        },
      },
      {
        text: "确认",
        onPress: () => {
          onComfirm?.(items);
        },
        textStyle: {
          fontSize: 14,
          color: "white",
        },
        style: {
          flex: 1,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: haveChecked ? "#FF9500" : "#C8CCD3",
        },
        disable: !haveChecked,
      },
    ];

    return (
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          paddingTop: 8,
          paddingBottom: bottom,
        }}
      >
        {buttonActions.map((buttonProps, index) => (
          <BaseButton
            key={(buttonProps.text as string) + index}
            {...buttonProps}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      isVisible={visible}
      statusBarTranslucent
      onBackButtonPress={onRequestClose}
      onBackdropPress={onRequestClose}
      style={{ margin: 0, justifyContent: "flex-end", flex: 1 ,}}
      hideModalContentWhileAnimating
      useNativeDriver
    >
      <Pressable style={{
        height: '100%',
        justifyContent: 'flex-end',
      }}>
        <View
          style={{
            minHeight: 600,
            maxHeight: 800,
            backgroundColor: "white",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            paddingHorizontal: 16,
          }}
        >
          <View style={styles.title}>
            <Text style={styles.noticeTitle}>{title}</Text>
            <Pressable
              onPress={onRequestClose}
              style={{ position: "absolute", right: 0 }}
            >
              <IconFont size={20} name="icgeneral_clear_fill" color="#C8CCD3" />
            </Pressable>
          </View>
          <Text style={styles.section}>材料</Text>
          <Text style={[styles.section, { fontWeight: "400", marginTop: 8 }]}>
            {materialName}
          </Text>
          <Divider
            style={{
              backgroundColor: "#E6E9EE",
              marginVertical: 20,
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.section}>需求品牌</Text>
            <Text style={styles.sectionValue}>
              从需求品牌中，选择您可供应的品牌
            </Text>
          </View>
          <ScrollView
            style={{
              flex: 1,
              marginTop: 12,
            }}
            contentContainerStyle={{
              flexGrow: 1,
            }}
          >
            {items.map((e) => (
              <CheckableItem
                data={e}
                onChange={(checked: boolean) => select(e.key, checked)}
              />
            ))}
          </ScrollView>
          {renderButton()}
        </View>
      </Pressable>
    </Modal>
  );
}

const CheckableItem = ({
  data: { title, checked },
  onChange,
}: {
  data: { title: string; checked: boolean };
  onChange?: (value: boolean) => void;
}) => {
  return (
    <Pressable
      onPress={() => onChange && onChange(!checked)}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      <Text style={{ fontSize: 16, color: "#010000" }}>{title}</Text>
      <CheckBox
        checked={checked}
        onChange={onChange}
        iconCheckedColor="#FF9500"
      />
    </Pressable>
  );
};

export const useChooseBrandModal = () => {
  const [visible, setVisible] = React.useState(false);
  const [selectItems, setSelectItems] = useState<BrandItem[]>();
  const [modalProps, setModalProps] = useState<ShowBrandProps>();

  const close = () => {
    setVisible(false);
  };

  const onSure = () => {
    setVisible(false);
    modalProps?.onComfirm?.(selectItems ?? []);
  };

  const select = (key: string, checked: boolean) => {
    setSelectItems(
      selectItems?.map((item) => {
        if (item.key === key) {
          return {
            ...item,
            checked,
          };
        }
        return item;
      })
    );
  };

  const renderChooseBrand = () => {
    return (
      <ChooseBrandModal
        visible={visible}
        onRequestClose={close}
        title={"供应品牌"}
        items={selectItems ?? []}
        select={select}
        {...modalProps}
        onComfirm={() => {
          onSure();
        }}
      />
    );
  };

  const showChooseBrand = (
    props: ShowBrandProps & {
      items: string[];
    }
  ) => {
    setSelectItems(
      props.items.map((e) => ({
        title: e,
        checked: false,
        key: e,
      }))
    );
    setModalProps({
      materialName: props.materialName,
      onComfirm: props.onComfirm,
    });
    setVisible(true);
  };

  return {
    show: showChooseBrand,
    close,
    renderChooseBrand,
  };
};

export default useChooseBrandModal;

const styles = StyleSheet.create({
  title: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  noticeTitle: {
    paddingVertical: 20,
    fontSize: 16,
    color: "#010000",
    fontWeight: "bold",
  },
  section: {
    fontSize: 16,
    color: "#010000",
    fontWeight: "bold",
  },
  sectionValue: {
    color: "#65686F",
    marginLeft: 8,
    fontWeight: "400",
    fontSize: 12,
  },
});
