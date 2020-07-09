﻿using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentSupport.RepositorySupport;
using Cloudy.CMS.ContentSupport.Serialization;
using Cloudy.CMS.ContentTypeSupport;
using Cloudy.CMS.DocumentSupport;
using Cloudy.CMS.UI.ContentAppSupport;
using Cloudy.CMS.UI.ContentAppSupport.Controllers;
using Cloudy.CMS.UI.FormSupport;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Tests
{
    public class ContentAppControllerTests
    {
        [Fact]
        public async void SavesOnlyAutoGeneratedFields()
        {
            var contentTypeId = "amet";
            var container = "vestibulum";

            var propertyDefinitions = new List<PropertyDefinitionDescriptor>
            {
                new PropertyDefinitionDescriptor(nameof(MyContent.Generated), typeof(string), c => ((MyContent)c).Generated, (c, v) => ((MyContent)c).Generated = (string)v, typeof(MyContent).GetProperty(nameof(MyContent.Generated)).GetCustomAttributes()),
                new PropertyDefinitionDescriptor(nameof(MyContent.NotGenerated), typeof(string), c => ((MyContent)c).NotGenerated, (c, v) => ((MyContent)c).NotGenerated = (string)v, typeof(MyContent).GetProperty(nameof(MyContent.NotGenerated)).GetCustomAttributes()),
            };

            var propertyDefinitionProvider = Mock.Of<IPropertyDefinitionProvider>();
            Mock.Get(propertyDefinitionProvider).Setup(p => p.GetFor(contentTypeId)).Returns(propertyDefinitions);

            var contentType = new ContentTypeDescriptor(contentTypeId, typeof(MyContent), container);

            var contentTypeRepository = Mock.Of<IContentTypeProvider>();
            Mock.Get(contentTypeRepository).Setup(r => r.Get(contentTypeId)).Returns(contentType);

            var id = "lorem";

            var a = new MyContent
            {
                Id = id,
                Generated = "ipsum",
                NotGenerated = "dolor",
            };

            var b = new MyContent
            {
                Id = id,
                Generated = "sit",
                NotGenerated = null,
            };

            var body = new SaveContentController.SaveContentRequestBody
            {
                Id = id,
                ContentTypeId = contentTypeId,
                Content = JsonConvert.SerializeObject(b),
            };

            var containerSpecificContentUpdater = Mock.Of<IContentUpdater>();

            Mock.Get(containerSpecificContentUpdater).Setup(u => u.UpdateAsync(It.IsAny<MyContent>())).Callback<IContent, string>((content, _) => {
                Assert.Equal(b.Generated, ((MyContent)content).Generated);
                Assert.Equal(a.NotGenerated, ((MyContent)content).NotGenerated);
            });

            var contentGetter = Mock.Of<IContentGetter>();

            Mock.Get(contentGetter).Setup(g => g.GetAsync<MyContent>(id, null)).Returns(Task.FromResult(a));

            var contentTypeCoreInterfaceProvider = Mock.Of<IContentTypeCoreInterfaceProvider>();

            var formProvider = Mock.Of<IPolymorphicCandidateProvider>();
            Mock.Get(formProvider).Setup(p => p.GetAll()).Returns(new List<PolymorphicCandidateDescriptor> { });

            await new SaveContentController(contentTypeRepository, contentGetter, contentTypeCoreInterfaceProvider, propertyDefinitionProvider, containerSpecificContentUpdater, null, new PolymorphicFormConverter(Mock.Of<ILogger<PolymorphicFormConverter>>(), formProvider, Mock.Of<IHumanizer>())).SaveContent(body);

            Mock.Get(containerSpecificContentUpdater).Verify(u => u.UpdateAsync(It.IsAny<MyContent>()));
        }

        public class MyContent : IContent
        {
            public string Id { get; set; }
            public string ContentTypeId { get; set; }

            [Display(AutoGenerateField = true)]
            public string Generated { get; set; }

            [Display(AutoGenerateField = false)]
            public string NotGenerated { get; set; }
        }
    }
}
