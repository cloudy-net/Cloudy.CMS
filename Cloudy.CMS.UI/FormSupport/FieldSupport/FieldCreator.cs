﻿using Poetry.UI.FormSupport.ControlSupport;
using Poetry.UI.FormSupport.ControlSupport.MatchingSupport;
using Poetry.UI.FormSupport.UIHintSupport;
using Poetry.UI.FormSupport.UIHintSupport.ParserSupport;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Poetry.UI.FormSupport.FieldSupport
{
    public class FieldCreator : IFieldCreator
    {
        IPropertyAttributeInheritor PropertyAttributeInheritor { get; }
        IInterfacePropertyMapper InterfacePropertyMapper { get; }
        IUIHintParser UIHintParser { get; }

        public FieldCreator(IPropertyAttributeInheritor propertyAttributeInheritor, IInterfacePropertyMapper interfacePropertyMapper, IUIHintParser uiHintParser)
        {
            PropertyAttributeInheritor = propertyAttributeInheritor;
            InterfacePropertyMapper = interfacePropertyMapper;
            UIHintParser = uiHintParser;
        }

        public FieldDescriptor Create(PropertyInfo property)
        {
            var displayAttribute = PropertyAttributeInheritor.GetFor<DisplayAttribute>(property).FirstOrDefault();

            var autoGenerate = displayAttribute?.GetAutoGenerateField() ?? true;
            var group = displayAttribute?.GetGroupName();
            
            var type = property.PropertyType;
            var isSortable = false;

            if(type.IsGenericType && (type.GetGenericTypeDefinition() == typeof(IEnumerable<>) || type.GetGenericTypeDefinition() == typeof(List<>) || type.GetGenericTypeDefinition() == typeof(IList<>)))
            {
                type = type.GetGenericArguments().Single();
                isSortable = true;
            }

            var uiHints = PropertyAttributeInheritor.GetFor<UIHintAttribute>(property)
                .Select(a => a.UIHint)
                .Select(uiHint => UIHintParser.Parse(uiHint))
                .ToList()
                .AsReadOnly();

            return new FieldDescriptor(property.Name, type, uiHints, isSortable, autoGenerate, group);
        }
    }
}
