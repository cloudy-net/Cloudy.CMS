﻿using Cloudy.CMS.EntityTypeSupport;
using Cloudy.CMS.Naming;
using Cloudy.CMS.PropertyDefinitionSupport;
using Cloudy.CMS.UI.Extensions;
using Cloudy.CMS.UI.FieldSupport.MediaPicker;
using Cloudy.CMS.UI.FieldSupport.Select;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Cloudy.CMS.UI.FieldSupport
{
    public record FieldCreator(IPropertyDefinitionProvider PropertyDefinitionProvider, IHumanizer Humanizer, IEntityTypeProvider EntityTypeProvider) : IFieldCreator
    {
        public IEnumerable<FieldDescriptor> Create(string entityType)
        {
            var result = new List<FieldDescriptor>();

            foreach (var propertyDefinition in PropertyDefinitionProvider.GetFor(entityType))
            {
                var displayAttribute = propertyDefinition.Attributes.OfType<DisplayAttribute>().FirstOrDefault();

                var autoGenerate = displayAttribute?.GetAutoGenerateField();
                var group = displayAttribute?.GetGroupName();

                var name = propertyDefinition.Name;
                var humanizedName = Humanizer.Humanize(name);

                if(propertyDefinition.AnyAttribute<ISelectAttribute>() && humanizedName.EndsWith(" id"))
                {
                    humanizedName = humanizedName.Substring(0, humanizedName.Length - " id".Length);
                }

                var label = displayAttribute?.GetName() ?? humanizedName;

                var type = propertyDefinition.Type;
                var uiHints = propertyDefinition.Attributes.OfType<UIHintAttribute>().Select(a => a.UIHint).ToList().AsReadOnly();

                string partialName = null;

                if (propertyDefinition.Type == typeof(string))
                {
                    partialName = "text";
                }

                if (propertyDefinition.Type == typeof(bool))
                {
                    partialName = "checkbox";
                }

                if (propertyDefinition.Type == typeof(int))
                {
                    partialName = "number";
                }

                if (propertyDefinition.Type == typeof(double))
                {
                    partialName = "decimal";
                }

                if (propertyDefinition.Type == typeof(DateTime) || propertyDefinition.Type == typeof(DateTimeOffset))
                {
                    partialName = "datetime";
                }

                if (propertyDefinition.Type == typeof(TimeSpan) || propertyDefinition.Type == typeof(TimeOnly))
                {
                    partialName = "time";
                }

                if (propertyDefinition.Type == typeof(DateOnly))
                {
                    partialName = "date";
                }

                if (propertyDefinition.AnyAttribute<ISelectAttribute>())
                {
                    partialName = "selectone";
                }

                if (propertyDefinition.Attributes.Any(a => a is MediaPickerAttribute))
                {
                    partialName = "media-picker/media-picker";
                }

                if (propertyDefinition.Enum)
                {
                    partialName = "enumdropdown";
                }

                if (uiHints.Any())
                {
                    partialName = uiHints.First();
                }

                var settings = new Dictionary<string, object>();

                if (propertyDefinition.Block)
                {
                    partialName = "embedded-block/embedded-block";
                    settings["types"] = EntityTypeProvider.GetAll().Select(t => t.Type).Where(t => t.IsAssignableTo(propertyDefinition.Type)).Select(t => t.Name).ToList().AsReadOnly();
                }

                if(partialName == null)
                {
                    partialName = "failed";
                }

                var partial = partialName != null ? (partialName.StartsWith('/') ? partialName : $"../../form/controls/{partialName}.js") : null;

                var renderChrome = true;

                if (uiHints.Contains("nochrome") || propertyDefinition.Block)
                {
                    renderChrome = false;
                }

                result.Add(new FieldDescriptor(name, type, label, partial, autoGenerate, renderChrome, group, settings));
            }
            
            return result;
        }
    }
}
