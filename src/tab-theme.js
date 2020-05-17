import {styled} from 'react-tabtab';
let {TabListStyle, ActionButtonStyle, TabStyle, PanelStyle} = styled;

TabListStyle = styled(TabListStyle)`
  // write css
`;

TabStyle = styled(TabStyle)`
  // write css
`;

ActionButtonStyle = styled(ActionButtonStyle)`
  // write css
`;

PanelStyle = styled(PanelStyle)`
  // write css
`;

// need to follow this object naming
module.exports = {
  TabList: TabListStyle,
  ActionButton: ActionButtonStyle,
  Tab: TabStyle,
  Panel: PanelStyle
}