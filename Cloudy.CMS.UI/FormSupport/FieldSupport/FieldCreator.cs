﻿using Cloudy.CMS.ContentTypeSupport;
using Cloudy.CMS.Naming;
using Cloudy.CMS.UI.FormSupport.FieldTypes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Cloudy.CMS.UI.FormSupport.FieldSupport
{
    public class FieldCreator : IFieldCreator
    {
        IPropertyDefinitionProvider PropertyDefinitionProvider { get; }
        IHumanizer Humanizer { get; }
        IFieldTypeMapper FieldTypeMapper { get; set; }

        public FieldCreator(IPropertyDefinitionProvider propertyDefinitionProvider, IHumanizer humanizer, IFieldTypeMapper fieldTypeMapper)
        {
            PropertyDefinitionProvider = propertyDefinitionProvider;
            Humanizer = humanizer;
            FieldTypeMapper = fieldTypeMapper;
        }

        public IEnumerable<FieldDescriptor> Create(string contentType)
        {
            var result = new List<FieldDescriptor>();

            foreach (var propertyDefinition in PropertyDefinitionProvider.GetFor(contentType))
            {
                var displayAttribute = propertyDefinition.Attributes.OfType<DisplayAttribute>().FirstOrDefault();

                var autoGenerate = displayAttribute?.GetAutoGenerateField() ?? true;
                var group = displayAttribute?.GetGroupName();

                var name = propertyDefinition.Name;
                var humanizedName = Humanizer.Humanize(name);

                if(propertyDefinition.Attributes.OfType<SelectAttribute>().Any() && humanizedName.EndsWith(" id"))
                {
                    humanizedName = humanizedName.Substring(0, humanizedName.Length - " id".Length);
                }

                var label = displayAttribute?.GetName() ?? humanizedName;

                var type = propertyDefinition.Type;
                var uiHints = propertyDefinition.Attributes.OfType<UIHintAttribute>().Select(a => a.UIHint).ToList().AsReadOnly();

                string partialName = null;

                if (propertyDefinition.Attributes.Any(a => a is SelectAttribute))
                {
                    partialName = "selectone";
                }

                if (propertyDefinition.Type == typeof(string))
                {
                    partialName = "text";
                }

                if (propertyDefinition.Enum)
                {
                    partialName = "enumdropdown";
                }

                if (uiHints.Any())
                {
                    partialName = uiHints.First();
                }

                if(partialName == null)
                {
                    partialName = "failed";
                }

                var partial = $"Form/{partialName}";

                var renderChrome = true;

                if (uiHints.Contains("nochrome") || propertyDefinition.Attributes.Any(c => c.GetType().GetCustomAttributes<UIHintAttribute>().Any(a => a.UIHint == "nochrome")))
                {
                    renderChrome = false;
                }

                result.Add(new FieldDescriptor(name, type, label, partial, autoGenerate, renderChrome, group));
            }
            
            return result;
        }
    }
}
