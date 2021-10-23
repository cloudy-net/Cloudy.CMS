﻿using Cloudy.CMS.ContentSupport.RepositorySupport;
using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentTypeSupport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Serialization;
using Cloudy.CMS.ContentSupport.RuntimeSupport;

namespace Cloudy.CMS.UI.ContentAppSupport.Controllers
{
    [Authorize("Cloudy.CMS.UI")]
    [Area("Cloudy.CMS")]
    public class SaveContentController : Controller
    {
        IContentTypeProvider ContentTypeProvider { get; }
        IContentGetter ContentGetter { get; }
        IPropertyDefinitionProvider PropertyDefinitionProvider { get; }
        IContentSaver ContentSaver { get; }
        IPrimaryKeyPropertyGetter PrimaryKeyPropertyGetter { get; }
        CamelCaseNamingStrategy CamelCaseNamingStrategy { get; } = new CamelCaseNamingStrategy();
        IContentInstanceCreator ContentInstanceCreator { get; }

        public SaveContentController(IContentTypeProvider contentTypeProvider, IContentGetter contentGetter, IPropertyDefinitionProvider propertyDefinitionProvider, IContentSaver contentSaver, IPrimaryKeyPropertyGetter primaryKeyPropertyGetter, IContentInstanceCreator contentInstanceCreator)
        {
            ContentTypeProvider = contentTypeProvider;
            ContentGetter = contentGetter;
            PropertyDefinitionProvider = propertyDefinitionProvider;
            ContentSaver = contentSaver;
            PrimaryKeyPropertyGetter = primaryKeyPropertyGetter;
            ContentInstanceCreator = contentInstanceCreator;
        }

        [HttpPost]
        public async Task<ContentResponseMessage> SaveContent([FromBody] SaveContentRequestBody data)
        {
            if (!ModelState.IsValid)
            {
                return ContentResponseMessage.CreateFrom(ModelState);
            }

            foreach (var change in data.Changes)
            {
                var contentType = ContentTypeProvider.Get(change.ContentTypeId);

                object content;

                if(change.KeyValues == null)
                {
                    content = ContentInstanceCreator.Create(contentType);
                }
                else
                {
                    content = await ContentGetter.GetAsync(contentType.Id, change.KeyValues).ConfigureAwait(false);
                }

                var propertyDefinitions = PropertyDefinitionProvider.GetFor(contentType.Id).ToDictionary(p => CamelCaseNamingStrategy.GetPropertyName(p.Name, false), p => p);
                var idProperties = PrimaryKeyPropertyGetter.GetFor(content.GetType());

                foreach (var changedField in change.ChangedFields)
                {
                    var propertyDefinition = propertyDefinitions[changedField.Name];

                    if(idProperties.Any(p => p.Name == propertyDefinition.Name))
                    {
                        throw new Exception("Tried to change primary key!");
                    }

                    var display = propertyDefinition.Attributes.OfType<DisplayAttribute>().FirstOrDefault();

                    if (display != null && display.GetAutoGenerateField() == false)
                    {
                        continue;
                    }

                    propertyDefinition.Setter(content, changedField.Value);
                }

                if (!TryValidateModel(content))
                {
                    return ContentResponseMessage.CreateFrom(ModelState);
                }

                await ContentSaver.SaveAsync(content).ConfigureAwait(false);
            }

            return new ContentResponseMessage(true, "Updated");
        }

        public class SaveContentRequestBody
        {
            public IEnumerable<SaveContentRequestBodyChange> Changes { get; set; }
        }

        public class SaveContentRequestBodyChange
        {
            public string[] KeyValues { get; set; }
            [Required]
            public string ContentTypeId { get; set; }
            [Required]
            public SaveContentMappingChange[] ChangedFields { get; set; }
        }

        public class SaveContentMappingChange
        {
            public string Name { get; set; }
            public string Value { get; set; }
        }

        public class ContentResponseMessage
        {
            public bool Success { get; }
            public string Message { get; }
            public IDictionary<string, IEnumerable<string>> ValidationErrors { get; }

            public ContentResponseMessage(bool success)
            {
                Success = success;
                ValidationErrors = new ReadOnlyDictionary<string, IEnumerable<string>>(new Dictionary<string, IEnumerable<string>>());
            }

            public ContentResponseMessage(bool success, string message)
            {
                Success = success;
                Message = message;
                ValidationErrors = new ReadOnlyDictionary<string, IEnumerable<string>>(new Dictionary<string, IEnumerable<string>>());
            }

            public ContentResponseMessage(IDictionary<string, IEnumerable<string>> validationErrors)
            {
                Success = false;
                Message = "Validation failed";
                ValidationErrors = new ReadOnlyDictionary<string, IEnumerable<string>>(new Dictionary<string, IEnumerable<string>>(validationErrors));
            }

            public static ContentResponseMessage CreateFrom(ModelStateDictionary modelState)
            {
                return new ContentResponseMessage(modelState.ToDictionary(i => i.Key, i => i.Value.Errors.Select(e => e.ErrorMessage)));
            }
        }
    }
}
